---
type: posts
draft: false

title: "Linking C++ code with Mathematica using LibraryLink"
subtitle: ""
date: 2018-02-13T18:00:00-06:00

authors:
  - me

preview:
  - Sometimes we want to make our Mathematica code run faster by writing some computationally intensive part of the code using C/C++. If the code itself is simple enough, we can use Compile to have Mathematica generate compiled C code automatically. But in more complex case, Compile will not work and we need LibraryLink.

tags:
  - Code
  - Mathematica

---
{{< oldpostflag >}}

Sometimes we want to make our Mathematica code run faster by writing some computationally intensive part of the code using C/C++. If the code itself is simple enough, we can use {{< mmaf Compile >}} to have Mathematica generate compiled C code automatically. But in more complex cases, {{< mmaf Compile >}} will not work and we need {{< mmaf LibraryFunction >}}. This post provides a minimal skeleton for future references. A complete guide can be found in documentation center {{< mmaf "LibraryLink/tutorial/Overview" false >}} or online [here](https://reference.wolfram.com/language/LibraryLink/tutorial/Overview.html).

## Overview
The usage of LibraryLink falls mainly into two categories. 

- The first one is to perform computationally intensive tasks using C/C++ (and you believe there is no native Mathematica function that does the same job faster than your implementation) or there is existing C/C++ code you want to reuse through Mathematica. 
- The second one is to manage C++ objects within Mathematica so that we can fully utilize the power of Mathematica.

## Prerequisites
We need three files {{< mmaf "WolframLibrary.h" false >}}, {{< mmaf "dllexport.h" false >}} and {{< mmaf "extern.h" false >}}. They can be downloaded from Wolfram or [here]({{< ref "posts/mma-library-function" >}}/LibraryLink.zip). 
For better management of the code files, let's organize files as follows. (Any other structures applies. Just change the code accordingly.)
{{< highlight plaintext >}}
[nc]/
-- /src
   -- dllexport.h
   -- extern.h
   -- WolframLibrary.h
   -- ...
-- /bin
   -- ...
-- notebook.nb
-- ...
{{< /highlight >}}

## Perform computationally intensive tasks using C++
Suppose we have a C++ function as follows
{{< highlight cpp >}}
int func1()
{
  // perform super intensive computations
  return 42;
}
{{< /highlight >}}

To call this function inside Mathematica, we create a C++ file {{< mmaf "link.cpp" false >}} inside {{< mmaf "/src" false >}} folder with the following code:
{{< highlight cpp >}}
// link.cpp
#include "WolframLibrary.h"

int func1()
{
  // perform super intensive computations
  return 42;
}

EXTERN_C DLLEXPORT int MMAFunc1(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
	if (Argc != 0)
        return LIBRARY_FUNCTION_ERROR;
    
    mint result = func1();
    MArgument_setInteger(res, result);
	
	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT mint WolframLibrary_getVersion()
{
    return WolframLibraryVersion;
}

EXTERN_C DLLEXPORT void WolframLibrary_uninitialize( WolframLibraryData libData)
{
    return;
}
{{< /highlight >}}

In Mathematica, we need the following code to compile the library and load the function:
{{< highlight mathematica >}}
(* notebook.nb *)
Needs["CCompilerDriver`"];

(* File path to source c++ file *)
sourceFile = FileNameJoin[{NotebookDirectory[], "src", "link.cpp"}];
(* Directory to put the lib file *)
targetPath = FileNameJoin[{NotebookDirectory[], "bin"}];

(* Name of lib file *)
libName = "myLib";
If[FileExistsQ[sourceFile],
  libFile = CreateLibrary[
    {sourceFile},
    libName, 
    "TargetDirectory" -> targetPath
  ];
  Export[FileNameJoin[{targetPath, "ext.dat"}], FileExtension[libFile]]
  ,
  Return[$Failed]
  ];

dllPath = FileNameJoin[{
    targetPath,
    libName <> "." <> Import[FileNameJoin[{targetPath, "ext.dat"}]]
    }];
{{< /highlight >}}

If this is successful, in the {{< mmaf "/bin" false >}} folder you will find the library with the specified name. To call the function in Mathematica, we can use the following code:
{{< highlight mathematica >}}
(* Necessary if re-compile *)
Quiet @ LibraryUnload[dllPath];
MMAFunc1 = LibraryFunctionLoad[dllPath, "MMAFunc1", {}, Integer];
{{< /highlight >}}

Here, the arguments of {{< mmaf LibraryFunctionLoad >}} are:

1. The path to the library;
2. The name of the C/C++ function and it should be the same as in the C++ source file;
3. The argument types of the C/C++ function (should be enclosed by {{< mmaf "{}" false >}});
4. The return types of the C/C++ function.

This table includes the most used data types and the corresponding types in C++.

| Mathematica                          | C++         |
| ------------------------------------ | ----------- | 
| {{< mmaf "True \| False" false >}}   | mbool       |
| {{< mmaf "Integer"  >}}              | mint        | 
| {{< mmaf "Real"  >}}                 | double      |
| {{< mmaf "Complex"  >}}              | mcomplex    |
| {{< mmaf "{dtype, r}" false >}}      | MTensor     |
| {{< mmaf "\"UTF8String\"" false >}}  | char *      |
| {{< mmaf "Void" false >}}            | void        |


Now we can call the function and get the result:
{{< highlight mathematica >}}
MMAFunc1[]
(* 42 *)
{{< /highlight >}}


## Manage C++ objects through Mathematica
In this scenario, we have some object written in C++ and we want to use Mathematica to manage the construction and destruction and call the methods of such object.
For example, if we have the following object:
{{< highlight cpp >}}
class MyObject
{
public:
    MyObject() = default;
    ~MyObject() = default;
    
    int getData() {
        return data;
    }
    void setData(int _data) {
        this->data = _data;
    }
    int calculate() {
        return data * data + 42;
    }

private:
    int data = 0;
};
{{< /highlight >}}

Again, we need the following code. I highlighed the parts where the managing interface of the object is implemented.
{{< mmaf mode false >}} is an variable indicating the operation Mathematica tries to do to the object. When {{< mmaf "mode = 0" false >}}, Mathematica tries to create the object; while if {{< mmaf "mode = 1" false >}}, the object is being destructed.
{{< highlight cpp "hl_lines=27-42">}}
// managed.cpp
#include "WolframLibrary.h"
#include <unordered_map>

#define MODULE_NAME "MyObject"

class MyObject
{
public:
    MyObject() = default;
    ~MyObject() = default;
    
    int getData() {
        return data;
    }
    void setData(int _data) {
        this->data = _data;
    }
    int calculate() {
        return data * data + 42;
    }

private:
    int data = 0;
};

typedef std::unordered_map<mint, MyObject*> MyObjectMap;
static MyObjectMap map;

EXTERN_C DLLEXPORT void manage_instance(WolframLibraryData libData, mbool mode, mint id) {
	if (mode == 0) {
		MyObject *T = new(MyObject);
		map[id] = T;
	}
	else {
		MyObject *T = map[id];
		if (T != nullptr) {
			delete T;
			map.erase(id);
		}
	}
}

EXTERN_C DLLEXPORT int MyGet(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
	if (Argc != 1)
        return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);

	MyObject *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

    mint result = T->getData();
    MArgument_setInteger(res, result);
	
	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int MySet(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
    if (Argc != 2)
        return LIBRARY_FUNCTION_ERROR;
    mint id = MArgument_getInteger(Args[0]);
    
    MyObject *T = map[id];
    if (T == nullptr) return LIBRARY_FUNCTION_ERROR;
    
    mint _set = MArgument_getInteger(Args[1]);
    T->setData(_set);
    
    return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int MyCalculate(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
    if (Argc != 1)
        return LIBRARY_FUNCTION_ERROR;
    mint id = MArgument_getInteger(Args[0]);

    MyObject *T = map[id];
    if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

    mint result = T->calculate();
    MArgument_setInteger(res, result);

    return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT mint WolframLibrary_getVersion() {
	return WolframLibraryVersion;
}

EXTERN_C DLLEXPORT int WolframLibrary_initialize(WolframLibraryData libData) {
	return libData->registerLibraryExpressionManager(MODULE_NAME, manage_instance);
}

EXTERN_C DLLEXPORT void WolframLibrary_uninitialize(WolframLibraryData libData) {
	int err = libData->unregisterLibraryExpressionManager(MODULE_NAME);
}
{{< /highlight >}}


Similarly, in Mathematica, we first compile the libraray and load the functions:
{{< highlight mathematica >}}
(* notebook.nb *)
Needs["CCompilerDriver`"];

(*File path to source c++ file*)
sourceFile = FileNameJoin[{NotebookDirectory[], "src", "managed.cpp"}];
(*Directory to put the lib file*)
targetPath = FileNameJoin[{NotebookDirectory[], "bin"}];

(*Name of lib file*)
libName = "myObject";
If[FileExistsQ[sourceFile],
  libFile = CreateLibrary[
    {sourceFile},
    libName, 
    "TargetDirectory" -> targetPath
  ];
  Export[FileNameJoin[{targetPath, "ext.dat"}], FileExtension[libFile]]
  ,
  Return[$Failed]
  ];

dllPath = FileNameJoin[{
    targetPath,
    libName <> "." <> Import[FileNameJoin[{targetPath, "ext.dat"}]]
    }];

(* Necessary if re-compile *)
Quiet @ LibraryUnload[dllPath];

MyGet = LibraryFunctionLoad[dllPath, "MyGet", {Integer}, Integer];
MySet = LibraryFunctionLoad[dllPath, "MySet", {Integer, Integer}, 
   "Void"];
MyCalculate = 
  LibraryFunctionLoad[dllPath, "MyCalculate", {Integer}, Integer];
{{< /highlight >}}

Mathematica provides three functions to manage the objects. They are {{< mmaf CreateManagedLibraryExpression >}}, {{< mmaf ManagedLibraryExpressionID >}} and {{< mmaf ManagedLibraryExpressionQ >}}. The following code shows the usage of them.
{{< highlight mathematica >}}
obj = CreateManagedLibraryExpression["MyObject", MyObject]
(* MyObject[1] *)

ManagedLibraryExpressionID[MyObject[1]]
(* 1 *)

ManagedLibraryExpressionQ[MyObject[1]]
(* True *)

ManagedLibraryExpressionQ[MyObject[100]]
(* False *)

MyGet[ManagedLibraryExpressionID @ obj]
(* 0 *)

MySet[ManagedLibraryExpressionID @ obj, 10]
MyGet[ManagedLibraryExpressionID @ obj]
(* 10 *)

MyCalculate[ManagedLibraryExpressionID @ obj]
(* 142 *)
{{< /highlight >}}



## Update: 06-13-2018
Szabolcs Horvát have already developed a very useful tool called [LTemplate](https://github.com/szhorvat/LTemplate) that can save us from writing the boilerplate code every time we need LibraryLink. Do check it out!
