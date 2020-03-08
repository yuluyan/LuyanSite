---
type: "projects"
title: "Stochastic Model of Spiking Neural Network"
date: 2020-03-06T00:00:00-00:00
thumbnail: gl-model-ani.gif
singlepage: true
---

The virtuosity of the [spiking neural networks](https://en.wikipedia.org/wiki/Spiking_neural_network) in biological brains have always been intriguing to people. Truly, a single neuron is easy to understand. However, when putting an astronomical amount of them together and they start to talk to each other, the complexity quickly go beyond control.

To pave the way of gaining more understanding of such networks, this project focuses on the stochastic modeling of the network. The goal is to develop efficient algorithms that can compute the statistical quantities of any given network without performing simulations.

<!--more--> 

## Mathematical model of spiking neurons
I would recommend anyone wants to know more about computational neuroscience [this online book](https://neuronaldynamics.epfl.ch/online/index.html). It is a well-written material suitable for anyone with a quantitative background but basic-to-zero knowledge in neuroscience.

### Integrate and fire model



### Stochastic intensity formulation




## Simulation of spiking neural networks
Before dive into the theory, we really need a way to simulate the spiking neural network so that it can help us to gain insights and verify the theory. There are a lot of highly-developed simulation packages available such as [NEURON](https://neuron.yale.edu/neuron/), [Brain](https://briansimulator.org/), [GENESIS](http://genesis-sim.org/), [NEST](https://www.nest-simulator.org/) and so on. A comprehensive list can be found in this article {{< bibcite 1 >}} 




## References

{{< bibref 1 "Ruben A. Tikidji-Hamburyan, Vikram Narayana, Zeki Bozkus and Tarek A. El-Ghazawi" "Software for Brain Network Simulations: A Comparative Study" "Frontiers in neuroinformatics," "11, 46, 2017." "https://www.frontiersin.org/articles/10.3389/fninf.2017.00046/full" >}}