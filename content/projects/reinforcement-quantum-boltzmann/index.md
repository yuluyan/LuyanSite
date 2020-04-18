---
type: "projects"
title: "Reinforcement Learning with Quantum Restricted Boltzmann Machine"
date: 2017-01-01T00:00:00-00:00
thumbnail: robot_think.png
thumbnaildark: robot_think-dark.png
singlepage: true
---

The idea of quantum Boltzmann machine is straight-forward: simply replace the hidden and visible layers with the quantum [Pauli spins](https://en.wikipedia.org/wiki/Pauli_matrices). But doing so will make the problem computationally intractable on a classical computer due to the exponentially large state space. Unless we have a real quantum computer, we will not be able to train the Boltzmann machine.

Instead, if we only quantize the hidden unit layer and keep the visible layer classical, we avoid intractable computations and meanwhile *'steal'* some benefits from the quantum world. One such benefit we observe is that it can somehow avoid local minima during the searching of state space if we apply the quantum restricted Boltzmann machine to reinforcement learning tasks.

<!--more--> 

## Restricted Boltzmann machine
A restricted Boltzmann machine (RBM){{< bibcite 1 >}}.is a bipartite graph endowed with a [Markov random field](https://en.wikipedia.org/wiki/Markov_random_field) (basically means a set of random variables). Each RBM has 

- a layer of $n$ **hidden** vertices with values $h_i\in \\{-1,1\\}$ and weights $c_i$, and 
- a layer of $m$ **visible** vertices with values $v\_j\in \\{-1,1\\}$ and weights $b_j$. 

*'Restricted'* means there is no connection within each layer while there are full connection between the two layers, weighted by connectivity matrix $w_{ij}$.

{{< figure src="rbm.png#center" width="400">}}
$$\def\bm{\boldsymbol}$$

Given the value of all hidden and visible vertices $(\bm{v},\bm{h})$, called a configuration, we associate a real value to it by
$$
E\_{\text{RBM}}(\bm{v},\bm{h}) =
- \sum\_{j=1}^m \sum\_{i=1}^n w\_{ij} h\_i v\_j
- \sum\_{j=1}^m b\_j v\_j
- \sum\_{i=1}^n c\_i h\_i
$$
$E\_\text{RBM}(\bm{v},\bm{h})$ is called the energy function of RBM. Then we can define the probability for such configuration to occur by the boltzmann weighting
$$
p(\bm{v},\bm{h})=\frac{1}{Z}e^{-E(\bm{v},\bm{h})},
$$
where $Z=\sum\_{\bm{v},\bm{h}} e^{-E(\bm{v},\bm{h})}$ is the partition function. Moreover, the conditional probability function of each layer can be defined as
$$
p(\bm{v} | \bm{h})=\frac{1}{Z(\bm{v})}\sum\_{\bm{h}}e^{-E(\bm{v},\bm{h})}, \,\,
p(\bm{h} | \bm{v})=\frac{1}{Z(\bm{h})}\sum\_{\bm{v}}e^{-E(\bm{v},\bm{h})},
$$
where $Z(\bm{v})=\sum\_{\bm{h}} e^{-E(\bm{v},\bm{h})}$, $Z(\bm{h})=\sum\_{\bm{v}} e^{-E(\bm{v},\bm{h})}$ are partition functions of each layer.

### Quantum restricted Boltzmann machine

A (clamped) quantum restricted Boltzmann machine (qRBM) is constructed by simply replacing the hidden layer with Pauli spin matrices.
{{< figure src="rqbm.png#center" width="400">}}

Now the energy function becomes A Hamiltonian
$$
  H\_{\text{qRBM}}(\bm{v}) =
  - \sum\_{v,h} w_{vh} v \sigma_h^z
  - \sum\_{h} c_h \sigma_h^z
  - \sum\_{h} \Gamma_h \sigma_h^x.
$$
Note that in the above equation, an extra term with $\sigma_x$ Pauli matrices is introduced to make the Hamiltonian non-trivial. And the probabilities can be defined similarly using the notations from quantum mechanics.


## Reinforcement learning in a nutshell

In the context of [reinforcement learning](https://en.wikipedia.org/wiki/Reinforcement_learning), we have an **agent** who can act differently according to the current state within some environment. The agent will get **reward** according to the **action** it chooses under some **state**. The goal of reinforcement learning is to find a **policy** to maximize agent's long-term reward. One of the most well-know algorithm in reinforcement learning is the [Q-learning](https://en.wikipedia.org/wiki/Q-learning) algorithm.

### Settings
Mathematically, an action in the action set $\mathcal{A}$ is a map which maps within the set of states $\mathcal{S}$, i.e., $a\in \mathcal{A}, a:\mathcal{S}\rightarrow \mathcal{S}$. In a more general situation, the state of agent $s$ becomes $a(s)$ with probability $p(s'\mid s,a)$ after perform action $a$. For simplicity, we only consider the case where $p(a(s)\mid s,a)=1$, i.e., the transition of states is definite.
Moreover, we can define the reward function $r(s,a)$ representing the immediate reward after performing action $a$ in state $s$. Reward is not necessarily a positive number. For example, we can use positive value for reward and negative number for **penalty**.

Our goal is to find a policy, which is a map $\pi:\mathcal{S}\rightarrow \mathcal{A}$, that maximizes the long term reward. Given policy $\pi$ and initial state $s_0$, we can generate a chain of actions and states accordingly
$$
s_0 \xrightarrow{\pi} a_0 \xrightarrow{} s_1 \xrightarrow{\pi} a_1 \xrightarrow{} s_2 \xrightarrow{\pi} \cdots \xrightarrow{} s_t \xrightarrow{\pi} a_t \xrightarrow{} \cdots
$$
With this state-action chain, we can then define the long term reward as a function of initial state under certain policy $\pi$ as
$$
\langle R(s) \rangle\_\pi = \left\langle \sum\_{k=0}^{\infty} \gamma^k r\_{k} \mid s\_0=s \right\rangle\_\pi
$$
where $r_k = r(s_k,a_k)$ is the reward from $k^{\text{th}}$ step and $\gamma\in[0,1)$ is a discount factor to ensure the convergence of the series.

### Q-learning
To solve this problem, Q-learning algorithm takes a step further. For given policy, it defines so-called Q-function
$$
Q^\pi(s,a) = \left\langle \sum\_{k=0}^{\infty} \gamma^k r\_{k} \mid s\_0=s, a\_0= a \right\rangle\_\pi
$$
If we can find a **point-wise optimal** Q-function varying policy $\pi$:  $Q^\ast=\max\_\pi Q^\pi$, we will be able to give the optimal policy $\pi^\ast(s)=\text{argmax}\_a Q^\ast(s,a)$. The existence of such optimal Q-function can be proved using [fixed point theorem](https://en.wikipedia.org/wiki/Banach_fixed-point_theorem) within an appropriately defined Banach space. Suppose we have found the optimal Q-function. It satisfies
$$
\begin{align}
Q^\ast(s,a) &= \left\langle r\_0+\gamma \sum\_{k=0}^{\infty} \gamma^k r\_{k+1} \mid s\_0=s, a\_0= a \right\rangle \\\ &= r(s,a)+\gamma \max\_{a'} Q^\ast(a(s),a').
\end{align}
$$
There is one equation for each pair of $(s,a)$, so overall we have $|\mathcal{S}|\times|\mathcal{A}|$ equations which can be solved iteratively
$$
  Q\_{n+1}(s,a) = r(s,a)+\gamma \max\_{a'}Q\_n(a(s),a').
$$

### Function approximation with qRBM
However, this method will take huge computational resources if the state or action space becomes large. Alternatively, we may want to choose some *a priori* function $Q(s,a;\bm{\theta})$ which is differentiable with respect to a reasonable number of parameters $\bm{\theta}$. We expect to find good solutions by minimizing the square of temporal difference
$$
  E\_\text{TD}=  r(s,a)+\gamma \max\_{a'}Q\_n(a(s),a') - Q\_{n+1}(s,a)
$$
The update rule of $\bm{\theta}$ is given by gradient descent
$$
  \Delta \bm{\theta}=-\nabla E\_\text{TD}^2  \approx \lambda E\_{\text{TD}} \nabla\_{\bm{\theta}} Q(s,a;\bm{\theta})
$$
where $\lambda$ is the learning rate. 

## Q-learning with RBM
The choice of such function approximator is where Boltzmann machine comes into play. The following procedure of using RBM as function approximator was proposed by Sallans{{< bibcite 2 >}}. If we arrange the elements in state set in a particular order $\\{s\_i\\}\_{i=1\cdots |\mathcal{S}|}$, then each element can be encoded into
$$
\bm{s}\_i
=(\underbrace{-1,\cdots,-1}\_{i-1 \text{times}},1,
\underbrace{-1,\cdots,-1}\_{|\mathcal{S}|-i \text{times}}),
$$
where we use bold letter $\bm{s}$ for the vector corresponding to state $s$ hereafter. We can carry on similar procedure for the action set. With such encoding, each state-action pair is a vector of the following form
$$
(\bm{s},\bm{a})
=(\underbrace{-1,\cdots,-1,1,-1,\cdots,-1}\_{\bm{s}},
\underbrace{-1,\cdots,-1,1,-1,\cdots,-1}\_{\bm{a}}).
$$
We can then construct an RBM with its visible layer being such state-action pair, i.e., $\bm{v}= (\bm{s},\bm{a})$ 
{{< figure src="rl_rbm.png#center" width="420">}}

The form of Q-function is chosen to be the negative free energy of the RBM
$$
Q(s,a)=-F(\bm{s},\bm{a}) = -\ln Z(\bm{s},\bm{a})
$$
As we know, a system in equilibrium has a **minimized free energy**. Since the process of maximizing Q-function is equivalent to the process of minimizing free energy, we expect our optimal Q-function to occur when the constructed RMB is in equilibrium.

### Replace the RBM with qRBM
Now we want to make use of our quantum RBM. Thanks to quantum mechanics, we can also define the free energy in this setting
$$
F(\bm{s},\bm{a}) = \text{Tr}\left[ \rho(\bm{s},\bm{a}) H(\bm{s},\bm{a}) \right]
$$
where $\rho(\bm{s},\bm{a})$ is the [density matrix](https://en.wikipedia.org/wiki/Density_matrix) of the qRBM defined as
$$
\rho(\bm{s},\bm{a}) = \frac{1}{Z(\bm{s},\bm{a})} e^{-H(\bm{s},\bm{a})}
$$

## Experiments
We demonstrate the power of qRBM using the [Grid World problem](https://towardsdatascience.com/reinforcement-learning-implement-grid-world-from-scratch-c5963765ebff). The following is a simple example of grid world. The green block is the reward and red block is penalty. Brown block is prohibited area.
{{< figure src="gw1.png#center" width="350">}}
The agents are supposed to find the following optimal actions at each position.
{{< figure src="gw1opt.png#center" width="350" >}}
Using Q-learning with qRBM, the agent can learn them effectively
{{< figure src="Q.gif#center" width="350" caption="Solve the grid world problem using Q-learning with qRBM">}}

## Our findings
We find that it is possible to avoid local minima during the learning process with qRBM. This is believed to be a quantum effect. In the following plots, the red learning curve is using the RBM and the blue one is using the qRBM. We can clearly see that the classical RBM falls into a local minimum for a period of time while the qRBM doesn't.
{{< figure src="g-local.png#center" width="400" >}}


## References

{{< bibref 1 "Asja Fischer and GChristian Igel" "An introduction to restricted Boltzmann machines" "Iberoamerican congress on pattern recognition. Springer," "Berlin, Heidelberg, 2012." "https://link.springer.com/chapter/10.1007/978-3-642-33275-3_2" >}}

{{< bibref 2 "Brian Sallans and Geoffrey E. Hinton" "Reinforcement learning with factored states and actions" "Journal of Machine Learning Research," "5(Aug): 1063-1088, 2004." "http://www.jmlr.org/papers/v5/sallans04a.html" >}}

{{< bibref 3 "Daniel Crawford, Anna Levit, Navid Ghadermarzy, Jaspreet S. Oberoi and Pooya Ronagh" "Reinforcement Learning Using Quantum Boltzmann Machines" "arXiv preprint" "arXiv:1612.05695, 2016." "https://arxiv.org/abs/1612.05695" >}}
