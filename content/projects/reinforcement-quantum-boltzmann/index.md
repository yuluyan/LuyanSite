---
type: "projects"
title: "Reinforcement Learning with Quantum Restricted Boltzmann Machine"
date: 2017-01-01T00:00:00-00:00
thumbnail: robot_think.png
singlepage: false
---

The idea of quantum Boltzmann machine is straight-forward: simply replace the hidden and visible layers with the quantum [Pauli spins](https://en.wikipedia.org/wiki/Pauli_matrices). But doing so will make the problem computationally intractable on a classical computer due to the exponentially large state space. Unless we have a real quantum computer, we will not be able to train the Boltzmann machine.

Instead, if we only quantize the hidden unit layer and keep the visible layer classical, we avoid intractable computations and meanwhile *'steal'* some benefits from the quantum world. One such benefit we observe is that it can somehow avoid local minima during the searching of state space if we apply the quantum restricted Boltzmann machine to reinforcement learning tasks.

<!--more--> 

## Quantum Boltzmann machine
