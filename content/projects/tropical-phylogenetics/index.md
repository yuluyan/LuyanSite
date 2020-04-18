---
type: "projects"
title: "Tropical Geometry of Phylogenetic Trees"
date: 2020-03-05T00:00:00-00:00
thumbnail: dog-phylo.svg
thumbnaildark: dog-phylo-dark.svg
singlepage: true
---

[Phylogenetic tree](https://en.wikipedia.org/wiki/Phylogenetic_tree) is widely used in many fields especially bioinfomatics. The evolution history manifested in the trees are powerful tools in the study of the migration of animals, spread of viruses and so on.

How to reconstruct **efficiently** and **effectively** such trees from real world data has been an problem of significant importance. This project utilized the tools from [tropical geometry](https://en.wikipedia.org/wiki/Tropical_geometry) to study the structures of the space consisted of the phylogenetic trees.
<!--more--> 

$$
\def\SHADE{\color{gray}}
\def\HIGH{\color{utcolor}}
$$

## Phylogenetic tree
Various models of phylogenetic trees are propsed and studied. One that is commonly used is the *rooted* tree with weights specified on each *internal node*. Here is an example of a phylogenetic tree on four species ${A,B,C,D}$. The lower the common ancestor is, the closer the two species are. For example, specie $A$ is closer to $B$ than to $D$.
{{< figure src="extree.png#center" width="270">}}
It has a corresponding matrix representation and we call it $\delta$. The $ij^{\,\text{th}}$ entry $\delta(i,j)$ represents the weight of the lowest common ancestor of specie $i$ and $j$. 
Notice that this matrix should be symmetric and has zero diagonal.
$$\delta=\left(
\begin{matrix}
\SHADE 0 & 5 & 7 & 9 \\\ \SHADE5 & \SHADE0 & 7 & 9 \\\ \SHADE7 & \SHADE7 & \SHADE0 & 9 \\\ \SHADE9 & \SHADE9 & \SHADE{9} & \SHADE0 \\\
\end{matrix}
\right)\in \mathbb{R}^{[4] \choose 2}$$

## Dissimilarity map
Typically, the differences between species are compared *pair-wisely* and quantified via some distance measures, e.g., Hamming distance of their gene sequences:
{{< figure src="comparegene.png#center" width="270">}}

Suppose we are interested in  4 species, we are likely to get a matrix called a ***dissimilarity map***, where the $ij^{\,\text{th}}$ entry $d(i,j)$ represents the distance between specie $i$ to $j$. 
Also, it is symmetric and has zero diagonal.
$$d=\left(
\begin{matrix}
\SHADE 0 & 2 & 4 & 6 \\\ \SHADE2 & \SHADE0 & 8 & 10 \\\ \SHADE4 & \SHADE8 & \SHADE0 & 12 \\\ \SHADE6 & \SHADE{10} & \SHADE{12} & \SHADE0 \\\
\end{matrix}
\right)\in \mathbb{R}^{[4] \choose 2}$$


Not all dissimilarity maps are valid phylogenetic trees. For it to be a valid tree, it should satisfy the so-called ***strengthened triangle inequality***:
$$\forall i,j,k,\,\, d(i,k) \leq \max(d(i,j), d(j,k))$$
A $d$ that satisfying such inequality is called an ***ultrametric***.

## Reconstruction
Thus, a natural question is how to reconstruct phylogenetic trees from the dissimilarity maps we acquired from experimental data. This has already been studied in the old days {{< bibcite 1 >}}{{< bibcite 2 >}}. But they give only one or few reconstructions that can potentially introduce bias to the later analysis. 

Our goal is to find a complete description of the reconstructed tree space. Before doing that, we need to find a way to measure how good our reconstruction is. A popular choice is the $\ell^\infty$-distance measure:
$$
{\left\lVert d-\delta \right\rVert}_{\infty} = \max |d(i,j)-\delta(i,j)|
$$

Then, mathematically, what we want to do is: given the experimental dissimilarity map $d$, find the *ultrametrics* that are the minimizers:
$$
\text{argmin}\_{\text{ultrametric } \delta} {\left\lVert d-\delta \right\rVert}_{\infty}
$$
Of course, we don't expect an analytical solution to that due to its combinatorial nature of the problem (think about permuting the vertices of the trees). Instead, we are in pursuit of an **efficient** algorithm, i.e., runs in $O(\text{poly})$ time, that can generate all such ultrametrics. But how can a problem with potentially combinatorially many solutions have an efficient algorithm?

## Tropical geometry
[Wikipedia](https://en.wikipedia.org/wiki/Tropical_geometry) says:

> Tropical geometry is a relatively new area in mathematics, which might loosely be described as a piecewise linear or skeletonized version of algebraic geometry, using the tropical semiring instead of a field.

which translated to human language is basically that: what if we replace the addition and multiplication in our everyday algebra to the $\max$ (or $\min$) operation and addition?
$$\begin{align}
+ &\rightarrow \max \,\,(\text{or } \min) \\\ \times &\rightarrow + 
\end{align}$$

Surprisingly, a lot of things can happen and people have found tropical analog of classical geometry and many non-trivial applications are proposed, e.g., tropical PCA{{< bibcite 3 >}}. A good resources of tropical geometry is [this book](https://books.google.com/books?lr=&id=zFsoCAAAQBAJ&oi=fnd&pg=PR9&dq=Diane+Maclagan+and+Bernd+Sturmfels.+Introduction+to+tropical+geometry,+volume+161.+American+Mathematical+Soc.,+2015.&ots=tglRboqD1p&sig=4S3ybqL9P9O6MDbrZZONpaNRPaY#v=onepage&q=Diane%20Maclagan%20and%20Bernd%20Sturmfels.%20Introduction%20to%20tropical%20geometry%2C%20volume%20161.%20American%20Mathematical%20Soc.%2C%202015.&f=false){{< bibcite 4 >}}.

## Why tropical geometry here?
The obvious reason is that both the strengthened triangle inequality
$$\forall i,j,k,\,\, d(i,k) \leq \max(d(i,j), d(j,k))$$
and the $\ell^\infty$-distance measure:
$$
{\left\lVert d-\delta \right\rVert}_{\infty} = \max |d(i,j)-\delta(i,j)|
$$
contains the $\max$ operation, which is perfectly suitable to study using tropical geometry. And there are many pioneer studies about efficient algorithms in tropical geometry{{< bibcite 5 >}}. Moreover, people have found deeper and profound connections between phylogenetic trees and tropical geometry{{< bibcite 6 >}}{{< bibcite 7 >}}.

Let's get back to our problem. What tropical geometry tells us is that the space of all minimizer ultrametrics is a ***tropical polytope***, which is the tropical analog of the classical polytope. 

{{< figure src="polytope.svg#center" width="180" caption="A tropical polytope projected on $\mathbb{R}^2$. Black dots are vertices of the polytope." >}}

A tropical polytope admits multiple vertices. Among those vertices, there is a special set of the vertices that fully describes the polytope --- they are called the ***extreme vertices*** or simply extremes. So the key question here is that whether or not we can find all the extreme vertices efficiently.

## Current progress
Firstly, given a vertex, we need to know whether it is an extreme. We've shown the previous characterization by Bernstein{{< bibcite 8 >}} for the extreme vertices is not sufficient for most cases. The only case when it's sufficient is when the number of the leaves of the tree is $3${{< bibcite 9 >}}.

We proposed an exterior description of the tropical polytope formed by the minimizer ultrametrics. Thus we can use the algorithms proposed by Allamigeon{{< bibcite 5 >}} to determine the extremality of a vertex efficiently. We can also compute all the extremes. However, the time complexity is exponential.

The tangent hypergraph techniques proposed in {{< bibcite 5 >}} enables us to transform each vertex of the polytope as a hypergraph. We are working on an algorithm that computes the extremes based on the manipulation of the hypergraph.

## References

#### Phylogenetic trees
{{< bibref 1 "Naoko Takezaki and Masatoshi Nei" "Genetic distances and reconstruction of phylogenetic trees from microsatellite DNA" "Genetics," "144(1):389-399, 1996." "https://www.genetics.org/content/144/1/389.short" >}}

{{< bibref 2 "Naruya Saitou and Masatoshi Nei" "The neighbor-joining method: a new method for reconstructing phylogenetic trees" "Molecular biology and evolution," "4(4):406-425, 1987." "https://academic.oup.com/mbe/article/4/4/406/1029664" >}}

#### Tropical geometry
{{< bibref 3 "Ruriko Yoshida, Leon Zhang and Xu Zhang" "Tropical principal component analysis and its application to phylogenetics" "Bulletin of mathematical biology," "81(2):568-597, 2019." "https://link.springer.com/article/10.1007/s11538-018-0493-4?shared-article-renderer" >}}

{{< bibref 4 "Diane Maclagan and Bernd Sturmfels" "Introduction to tropical geometry" "American Mathematical Soc.," "volume 161, 2015." "https://books.google.com/books?lr=&id=zFsoCAAAQBAJ&oi=fnd&pg=PR9&dq=Diane+Maclagan+and+Bernd+Sturmfels.+Introduction+to+tropical+geometry,+volume+161.+American+Mathematical+Soc.,+2015.&ots=tglRboqD1p&sig=4S3ybqL9P9O6MDbrZZONpaNRPaY#v=onepage&q=Diane%20Maclagan%20and%20Bernd%20Sturmfels.%20Introduction%20to%20tropical%20geometry%2C%20volume%20161.%20American%20Mathematical%20Soc.%2C%202015.&f=false" >}}

{{< bibref 5 "Xavier Allamigeon, Stephane Gaubert and Eric Goubault" "Computing the vertices of tropical polyhedra using directed hypergraphs" "Discrete & Computational Geometry," "49(2):247-279, 2013." "https://link.springer.com/article/10.1007/s00454-012-9469-6" >}}

{{< bibref 6 "Federico Ardila and Caroline J Klivans" "The Bergman complex of a matroid and phylogenetic trees" "Journal of Combinatorial Theory, Series B," "96(1):38-49, 2006." "https://www.sciencedirect.com/science/article/pii/S0095895605000687" >}}

{{< bibref 7 "Bo Lin, Anthea Monod and Ruriko Yoshida" "Tropical foundations for probability & statistics on phylogenetic tree space" "arXiv preprint" "arXiv:1805.12400, 2018." "https://arxiv.org/abs/1805.12400" >}}

{{< bibref 8 "Daniel Irving Bernstein" "L-infinity optimization to Bergman fans of matroids with an application to phylogenetics" "arXiv preprint" "arXiv:1702.05141, 2017." "https://arxiv.org/abs/1702.05141" >}}

{{< bibref 9 "Luyan Yu" "Extreme rays of the $\ell^\infty $-nearest ultrametric tropical polytope" "Linear Algebra and its Application," "587:23-44, 2019." "https://www.sciencedirect.com/science/article/abs/pii/S0024379519304665" >}}