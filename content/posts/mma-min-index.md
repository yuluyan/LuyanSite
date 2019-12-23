---
type: posts
draft: false

title: "Find the index of the minimal element using Mathematica"
subtitle: "Procedure of optimizing Mathematica code"
date: 2018-08-19T18:00:00-06:00

authors:
  - me

preview:
  - It occurred to me that I needed to find the minimal element (if there are multiple occurence, just return *any* one of them), as well as its position, in a list using mathematica. This seems to be a trivial problem and...

tags:
  - Code
  - Mathematica

---
{{< oldpostflag >}}

It occurred to me that I needed to find the minimal element (if there are multiple occurences, just return *any* one of them), as well as its position, in a list using mathematica. This seems to be a trivial problem and the easiest (but not the most efficient) way that came to the top of my head is the following one-liner code:

{{< highlight mathematica >}}
l = {2, 0, 1, 8};
{#, Position[l, #][[1, 1]]} &[Min[l]]
(* {0, 2} *)
{{< /highlight >}}
{{< mma ccdb8cde-3f19-4a91-847d-ebbd22551676 false >}}

## Native Solutions
Indeed, this worked just like as I wished and I was totally fine with it --- until the size of my list got larger and larger, to the magnitute of $10^8$. In following example, it takes almost 10 seconds to do so. This is definitely untolerable since this functionality will be called over and over in my use case.

{{< highlight mathematica >}}
l = RandomReal[{0, 10}, 10^8];
{#, Position[l, #][[1, 1]]} &[Min[l]] // AbsoluteTiming
(* {10.4191, {4.91679*10^-8, 7830224}} *)
{{< /highlight >}}
{{< mma 808ef58c-7dab-48c6-af95-018eff2d1c41 false >}}

Let's see where the bottleneck is. Finding the minimal really takes no time but the {{< mmaf Position >}} function is surprisingly slow. 
{{< highlight mathematica >}}
(min = Min[l]) // AbsoluteTiming
(* {0.031072, 4.91679*10^-8} *)

Position[l, min][[1, 1]] // AbsoluteTiming
(* {10.0715, 7830224} *)
{{< /highlight >}}
{{< mma 12a9e740-dd91-4e14-91ad-39194c851c4a false >}}

One reason is that {{< mmaf Position >}} tries to find all occurences but I only need one. We can instead use {{< mmaf FirstPosition >}} to avoid search the entire list. Now the time is 6 seconds. It's still not great.
{{< highlight mathematica >}}
{#, FirstPosition[l, #][[1]]} &[Min[l]] // AbsoluteTiming
(* {6.08502, {4.91679*10^-8, 7830224}} *)
{{< /highlight >}}
{{< mma cb804f8c-a4c7-4316-97bf-9b3b768ae80d false >}}

We know that both {{< mmaf Position >}} and {{< mmaf FirstPosition >}} are designed for general pattern matching and not specifically for numbers, which means they have to take care of different cases and inevitably bring down the performance. After doing some search, I found the {{< mmaf Ordering >}} function quite useful. Implying the list has an order, i.e., {{< mmaf Sort >}} can be applied to the list, it gives the ordering of the list. Using {{< mmaf Ordering >}} gives a significant boost in the performance, as shown in the example below.
{{< highlight mathematica >}}
{l[[#]], #} &[Ordering[l, 1][[1]]] // AbsoluteTiming
(* {0.37079, {4.91679*10^-8, 7830224}} *)
{{< /highlight >}}
{{< mma 04dc8bf6-aeb6-4d81-9b0f-66609b15361a false >}}

## Using CompiledFunction
OK now it's already 30x faster than what we have at first place. But can we do better? Sure. We can always resort to {{< mmaf Compile >}} when we really want speed. The following is the simple code for finding the minimal. Notice that {{< mmaf Do >}} is used. There is an old saying goes that we should not use {{< mmaf Do >}} in Mathematica, which is true in most cases. But here since we are generating C code but not Mathematica's high level operations, performing a single linear search with {{< mmaf Do >}} in C code will be very efficient. That's another 3x faster.
{{< highlight mathematica >}}
minAndPosCompiled = Compile[{{list, _Real, 1}},
   	Module[{idx = 1, min = First[list], len = Length[list]},
    		min;
    		Do[
     			If[min > list[[i]], min = list[[idx = i]]],
     		{i, 2, len}];
    	{min, idx }
    	], CompilationTarget -> "C", RuntimeOptions -> "Speed"
   ];
MinAndPosition[list_] := { #[[1]], IntegerPart[#[[2]]]} & [
   minAndPosCompiled[list]];

MinAndPosition[l] // AbsoluteTiming
(* {0.131404, {4.91679*10^-8, 7830224}} *)
{{< /highlight >}}
{{< mma 059ac86a-f521-4330-badb-b635a43c203a false >}}

Now it seems we've already pushed things to the extreme and the benefits of using Mathematica for fast coding are about to be lost. But can we do better? 

## Using Wolfram LibraryLink
To this point I have to elaborate about my situation: I need to maintain a list of numbers and frequently retrieve its minimal and the corresponding index but I only do few insertions or deletions. Sounds familiar, right? Yes, we can make use of the indexed min heap data structure to achieve $O(1)$ min-retrival time. But Mathematica doesn't have such built-in functionality. We have to manually implement it in C++ and link it to Mathematica using the method I described in another post. The following is a implementation of min heap in C++.
{{< highlight cpp >}}
#"IndexedMinHeap.h"
#ifndef __INDEXEDMINHEAP__
#define __INDEXEDMINHEAP__

#include <stdexcept>

template <typename T>
class IndexedMinHeap
{
public:
	IndexedMinHeap();
	~IndexedMinHeap();
	
	void initialize(int _capacity);
	void reinitialize(int _capacity);

	bool isEmpty();
	bool contains(int i);
	int getSize();
	int getCapacity();
	void insert(int i, T key);
	int minIndex();
	T minKey();
	int delMin();
	T keyOf(int i);
	void changeKey(int i, T key);
	void scaleKey(int i, T scale);
	void subtractScaleAddConstantToKey(int i, T scale, T constant);
	void decreaseKey(int i, T key);
	void increaseKey(int i, T key);
	void deleteKey(int i);

private:
	bool initialized;

	int capacity;
	int n;
	int *pq;
	int *qp;
	T *keys;

	bool greater(int i, int j);
	void swap(int i, int j);
	void swim(int k);
	void sink(int k);
};


template<typename T>
inline bool IndexedMinHeap<T>::greater(int i, int j)
{
	return keys[pq[i]] > keys[pq[j]];
}

template<typename T>
inline void IndexedMinHeap<T>::swap(int i, int j)
{
	int swap = pq[i];
	pq[i] = pq[j];
	pq[j] = swap;
	qp[pq[i]] = i;
	qp[pq[j]] = j;
}

template<typename T>
inline void IndexedMinHeap<T>::swim(int k)
{
	while (k > 1 && greater(k / 2, k)) {
		swap(k, k / 2);
		k /= 2;
	}
}

template<typename T>
inline void IndexedMinHeap<T>::sink(int k)
{
	while (k * 2 <= n) {
		int j = k * 2;
		if (j < n && greater(j, j + 1)) {
			j = j + 1;
		}
		if (!greater(k, j)) {
			break;
		}
		swap(k, j);
		k = j;
	}
}

template<typename T>
inline IndexedMinHeap<T>::IndexedMinHeap()
{
	initialized = false;
}

template<typename T>
inline IndexedMinHeap<T>::~IndexedMinHeap()
{
	if (initialized) {
		delete[] pq;
		delete[] qp;
		delete[] keys;
	}
}

template<typename T>
inline void IndexedMinHeap<T>::initialize(int _capacity)
{
	capacity = (_capacity > 0 ? _capacity : 0);
	n = 0;
	pq = new int[capacity + 1];
	qp = new int[capacity + 1];
	for (int i = 0; i <= capacity; ++i) {
		qp[i] = -1;
	}
	keys = new T[capacity + 1];
	initialized = true;
}

template<typename T>
inline void IndexedMinHeap<T>::reinitialize(int _capacity)
{
	if (initialized) {
		delete[] pq;
		delete[] qp;
		delete[] keys;
	}
	capacity = (_capacity > 0 ? _capacity : 0);
	n = 0;
	pq = new int[capacity + 1];
	qp = new int[capacity + 1];
	for (int i = 0; i <= capacity; ++i) {
		qp[i] = -1;
	}
	keys = new T[capacity + 1];
	initialized = true;
}


template<typename T>
inline bool IndexedMinHeap<T>::isEmpty()
{
	return n == 0;
}

template<typename T>
inline bool IndexedMinHeap<T>::contains(int i)
{
	if (i < 0 || i >= capacity) {
		throw std::invalid_argument("Invalid index.");
	}
	return qp[i] != -1;
}

template<typename T>
inline int IndexedMinHeap<T>::getSize()
{
	return n;
}

template<typename T>
inline int IndexedMinHeap<T>::getCapacity()
{
	return capacity;
}

template<typename T>
inline void IndexedMinHeap<T>::insert(int i, T key)
{
	if (contains(i)) {
		throw std::invalid_argument("Index already exists in priority queue.");
	}
	++n;
	qp[i] = n;
	pq[n] = i;
	keys[i] = key;
	swim(n);
}

template<typename T>
inline int IndexedMinHeap<T>::minIndex()
{
	if (n == 0) {
		throw std::underflow_error("Priority queue underflow.");
	}
	return pq[1];
}

template<typename T>
inline T IndexedMinHeap<T>::minKey()
{
	if (n == 0) {
		throw std::underflow_error("Priority queue underflow.");
	}
	return keys[pq[1]];
}

template<typename T>
inline int IndexedMinHeap<T>::delMin()
{
	if (n == 0) {
		throw std::underflow_error("Priority queue underflow.");
	}
	int min = pq[1];
	swap(1, n);
	sink(1);
	if (min != pq[n]) {
		throw std::runtime_error("Unexpected error when deleting min.");
	}
	qp[min] = -1;
	//keys[min] = T();
	pq[n] = -1;
	--n;
	return min;
}

template<typename T>
inline T IndexedMinHeap<T>::keyOf(int i)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	else {
		return keys[i];
	}
}

template<typename T>
inline void IndexedMinHeap<T>::changeKey(int i, T key)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	if (key > keys[i]) {
		keys[i] = key;
		sink(qp[i]);
	}
	if (key < keys[i]) {
		keys[i] = key;
		swim(qp[i]);
	}
}

template<typename T>
inline void IndexedMinHeap<T>::scaleKey(int i, T scale)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	if (scale > 1) {
		keys[i] *= scale;
		sink(qp[i]);
	}
	if (scale < 1) {
		keys[i] *= scale;
		swim(qp[i]);
	}
}

template<typename T>
inline void IndexedMinHeap<T>::subtractScaleAddConstantToKey(int i, T scale, T constant)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	T tmp = (keys[i] - constant) * scale + constant;
	if (tmp > keys[i]) {
		keys[i] = tmp;
		sink(qp[i]);
	}
	if (tmp < keys[i]) {
		keys[i] = tmp;
		swim(qp[i]);
	}
}

template<typename T>
inline void IndexedMinHeap<T>::decreaseKey(int i, T key)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	if (keys[i] <= key) {
		throw std::invalid_argument("Calling decreaseKey() with given argument would not strictly decrease the key.");
	}
	keys[i] = key;
	swim(qp[i]);
}

template<typename T>
inline void IndexedMinHeap<T>::increaseKey(int i, T key)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	if (keys[i] >= key) {
		throw std::invalid_argument("Calling increaseKey() with given argument would not strictly increase the key.");
	}
	keys[i] = key;
	sink(qp[i]);
}

template<typename T>
inline void IndexedMinHeap<T>::deleteKey(int i)
{
	if (!contains(i)) {
		throw std::invalid_argument("Index not exists in priority queue.");
	}
	int index = qp[i];
	swap(index, n--);
	swim(index);
	sink(index);
	//keys[i] = T();
	qp[i] = -1;
}

#endif
{{< /highlight >}}

To have these C++ code work with Mathematica, we need the Wolfram LibraryLink. In order not to make this post too tedius, I just post the glue code here without explanation. For more information about linking C++ code, check {{< mmaf LibraryFunctionLoad >}} or see my other [post]({{< ref "posts/mma-library-function" >}}).

{{< highlight cpp >}}
#"IndexedMinHeapLink.cpp"
#include "WolframLibrary.h"
#include "minheap.h"
#include <unordered_map>

#define MODULE_NAME "IMHeap"

typedef IndexedMinHeap<double> Heap;
typedef std::unordered_map<mint, Heap*> HeapMap;
static HeapMap map;

DLLEXPORT void manage_instance(WolframLibraryData libData, mbool mode, mint id) {
	if (mode == 0) {
		Heap *T = new(Heap);
		map[id] = T;
	}
	else {
		Heap *T = map[id];
		if (T != nullptr) {
			delete T;
			map.erase(id);
		}
	}
}

EXTERN_C DLLEXPORT int setCapacity(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
	if (Argc != 2) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);

	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	mint size = MArgument_getInteger(Args[1]);
	T->initialize(size);
	
	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int getCapacity(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 1) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);

	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	mint res = T->getCapacity();
	MArgument_setInteger(Res, res);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int release(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument res)
{
	if (Argc != 1) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	return libData->releaseManagedLibraryExpression(MODULE_NAME, id);
}

EXTERN_C DLLEXPORT int getKey(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 2) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	mint index = MArgument_getInteger(Args[1]);
	if (index <= 0 || index > T->getCapacity()) return LIBRARY_FUNCTION_ERROR;

	//!1-based to 0-based
	mreal key = T->keyOf(index - 1);
	MArgument_setReal(Res, key);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int getKeyList(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 2) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	MTensor TIndices = MArgument_getMTensor(Args[1]);
	if (libData->MTensor_getType(TIndices) != MType_Integer ||
		libData->MTensor_getRank(TIndices) != 1) {
		return LIBRARY_TYPE_ERROR;
	}

	mint *indices = libData->MTensor_getIntegerData(TIndices);
	mint count = libData->MTensor_getFlattenedLength(TIndices);

	MTensor Tres;
	int err = (*libData->MTensor_new)(MType_Real, 1, &count, &Tres);
	if (err) return err;
	mreal *data = libData->MTensor_getRealData(Tres);

	for (int i = 0; i < int(count); ++i) {
		//!1-based to 0-based
		if (indices[i] <= 0 || indices[i] > T->getCapacity()) return LIBRARY_FUNCTION_ERROR;
		data[i] = T->keyOf(indices[i] - 1);
	}

	MArgument_setMTensor(Res, Tres);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int fulfill(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 2) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	MTensor Tdata = MArgument_getMTensor(Args[1]);
	if (libData->MTensor_getType(Tdata) != MType_Real ||
		libData->MTensor_getRank(Tdata) != 1) {
		return LIBRARY_TYPE_ERROR;
	}

	mint count = libData->MTensor_getFlattenedLength(Tdata);
	T->reinitialize(count);
	mreal *data;
	data = libData->MTensor_getRealData(Tdata);
	for (int i = 0; i < int(count); ++i) {
		T->insert(i, data[i]);
	}

	MArgument_setMTensor(Res, Tdata);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int print(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 1) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	MTensor Tres;
	mint length = T->getSize();
	mint *dim = &length;

	int err = (*libData->MTensor_new)(MType_Real, 1, dim, &Tres);
	if (err) return err;

	mreal *data = libData->MTensor_getRealData(Tres);

	for (int i = 0; i < int(length); ++i) {
		data[i] = T->keyOf(i);
	}

	MArgument_setMTensor(Res, Tres);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int minIndex(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 1) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	//!0-based to 1-based
	mint index = T->minIndex() + 1;
	MArgument_setInteger(Res, index);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int minKey(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 1) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	mreal key = T->minKey();
	MArgument_setReal(Res, key);

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int changeKeyList(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	if (Argc != 3) return LIBRARY_FUNCTION_ERROR;
	mint id = MArgument_getInteger(Args[0]);
	Heap *T = map[id];
	if (T == nullptr) return LIBRARY_FUNCTION_ERROR;

	MTensor TIndices = MArgument_getMTensor(Args[1]);
	if (libData->MTensor_getType(TIndices) != MType_Integer ||
		libData->MTensor_getRank(TIndices) != 1) {
		return LIBRARY_TYPE_ERROR;
	}
	MTensor TChanges = MArgument_getMTensor(Args[2]);
	if (libData->MTensor_getType(TChanges) != MType_Real ||
		libData->MTensor_getRank(TChanges) != 1) {
		return LIBRARY_TYPE_ERROR;
	}

	mint count = libData->MTensor_getFlattenedLength(TIndices);
	if (libData->MTensor_getFlattenedLength(TChanges) != count) {
		return LIBRARY_DIMENSION_ERROR;
	}

	mint *indices = libData->MTensor_getIntegerData(TIndices);
	mreal *changes = libData->MTensor_getRealData(TChanges);

	for (int i = 0; i < int(count); ++i) {
		//!1-based to 0-based
		T->changeKey(indices[i] - 1, changes[i]);
	}

	return LIBRARY_NO_ERROR;
}

EXTERN_C DLLEXPORT int getAllIDs(WolframLibraryData libData, mint Argc, MArgument *Args, MArgument Res)
{
	mint i, n = map.size();
	mint dims[1];
	MTensor Tres;

	dims[0] = n;
	int err = libData->MTensor_new(MType_Integer, 1, dims, &Tres);
	if (err) return err;

	mint* elems = libData->MTensor_getIntegerData(Tres);
	HeapMap::const_iterator iter = map.begin();
	HeapMap::const_iterator end = map.end();
	for (i = 0; i < n; i++) {
		elems[i] = iter->first;
		if (iter != end) {
			iter++;
		}
	}
	MArgument_setMTensor(Res, Tres);
	return LIBRARY_NO_ERROR;
}

DLLEXPORT mint WolframLibrary_getVersion() {
	return WolframLibraryVersion;
}

EXTERN_C DLLEXPORT int WolframLibrary_initialize(WolframLibraryData libData) {
	return libData->registerLibraryExpressionManager(MODULE_NAME, manage_instance);
}

EXTERN_C DLLEXPORT void WolframLibrary_uninitialize(WolframLibraryData libData) {
	int err = libData->unregisterLibraryExpressionManager(MODULE_NAME);
}
{{< /highlight >}}

With all these code, as well as the "WolframLibrary.h", put in the /src directory w.r.t. the notebook, we can compile using the following code:
{{< highlight mathematica>}}
(* Code for compiling the source code *)
Needs["CCompilerDriver`"];

sourceFile = FileNameJoin[{
  NotebookDirectory[], "src", "IndexedMinHeapLink.cpp"
}];
targetPath = FileNameJoin[{NotebookDirectory[], "bin"}];

libFile = CreateLibrary[
  {sourceFile}, 
  "IndexedMinHeapLink", 
  "TargetDirectory" -> targetPath
];
Export[
  FileNameJoin[{targetPath, "extension.dat"}], 
  FileExtension[libFile]
];

(*Function for loading all the library function from C++ code*)
LoadIMHeapPackage[dllPath_] := Module[{},
  setCapacity = LibraryFunctionLoad[dllPath, "setCapacity", {Integer, Integer} ,"Void"];
	getCapacity = LibraryFunctionLoad[dllPath, "getCapacity", {Integer}, Integer];
	release = LibraryFunctionLoad[dllPath, "release", {Integer}, "Void"];
	getAllIDs = LibraryFunctionLoad[dllPath, "getAllIDs", {}, {Integer, 1}];
	fulfill = LibraryFunctionLoad[dllPath, "fulfill", {Integer, {Real, 1}}, {Real, 1}];
	getKey = LibraryFunctionLoad[dllPath, "getKey", {Integer, Integer}, Real];
	getKeyList = LibraryFunctionLoad[dllPath, "getKeyList", {Integer, {Integer, 1}}, {Real, 1}];
	print = LibraryFunctionLoad[dllPath, "print", {Integer}, {Real, 1}];
	minIndex = LibraryFunctionLoad[dllPath, "minIndex", {Integer}, Integer];
	minKey = LibraryFunctionLoad[dllPath, "minKey", {Integer}, Real];
	changeKeyList = LibraryFunctionLoad[dllPath, "changeKeyList", {Integer, {Integer, 1}, {Real, 1}}, "Void"];
];

IMHeapPackageLibraryExtension = 
  Import[FileNameJoin[{IMHeapPackageLibraryPath, "extension.dat"}]];
LoadIMHeapPackage[
  FileNameJoin[{IMHeapPackageLibraryPath, 
    "IndexedMinHeapLink." <> IMHeapPackageLibraryExtension}]];

(* Some wrapper for user to use the data structure *)
CreateIMHeap[data_List] := Module[{heap, id, length},
   	heap = CreateManagedLibraryExpression["IMHeap", IMHeap];
   	id = IMHeapID[heap];
   	length = Length[data];
   	setCapacity[id, length];
   	fulfill[id, data];
   	heap
   ];
GetValue[heap_IMHeap, index_Integer] := 
  getKey[IMHeapID[heap], index];
GetMinIndex[heap_IMHeap] := minIndex[IMHeapID[heap]];
{{< /highlight >}}

Now let's see how it performs:
{{< highlight mathematica >}}
heap = CreateIMHeap[l];
{GetMinValue[heap], GetMinIndex[heap]} // AbsoluteTiming
(* {0.000017, {4.91679*10^-8, 7830224}} *)
{{< /highlight >}}
{{< mma c82012e7-fbf0-42ed-8083-81bcf46ce4ff false >}}

Amazing! But be aware that we sacrifice the constant insertion or deletion operations that are now of time $O(\log n)$. Also, going through this approach wipes away completely the ease of writing Mathematica code. In practice, we should choose the right amount of optimization that suits our needs.