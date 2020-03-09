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
For more complete information, I would recommend [this online book](https://neuronaldynamics.epfl.ch/online/index.html). It is a well written material suitable for anyone with a quantitative background interested in computational neuroscience but with basic-to-zero knowledge in neuroscience.

{{< figure src="neuron.png#center" width="400">}}

So a neuron looks like this. There are four basic building block: 

1. The **dendrites** receive signals from other neurons and propagate them to the soma; and
2. the **soma**, which is the cell body of the neuron, collects the signals from dendrites and fires electrical signals when it receives enough inputs; then
3. the **axon** transmits the signal and triggers the release of neurotransmitter to the synapses;
4. the **synapses**, which are the gaps between the axon ends and the dendrites of next neurons, let the chemical pass on and trigger succeeding dendrites.

> **FUN FACT**: The yellow wraps on the axon are Meylin sheath. They are like the rubber layer of copper wires. They also help to increase the speed of transmission of the electrical signals in the axon. Meylin sheaths are formed by one of the glial cells. In this study{{< bibcite 1 >}} on Einstein's brain, it is showed that there are significantly more fraction of such cells in one region of Einstein's brain than other human brains they tested. This might be a reason for Einstein to be a genius. (**But no one is really sure**. Maybe without so many glial cells, Einstein would've already [unified quantum theory and gravitation](https://www.livescience.com/58861-unified-field-theory.html).)


### Leaky integrate and fire model
You may have heard of the Nobel Prize winning model -- Hodgkin-Huxley mode. But here I will not introduce it. Instead let's look at a simpler model -- the leaky integrate and fire model. This model treats a neuron as just a capacitor who fires whenever it reaches a threshold voltage and leaks over time.
{{< figure src="circuit.png#center" width="250" caption="Circuit diagram of leaky integrate and fire model">}}
Mathematically, the membrane voltage $V_m(t)$ satisfies the ordinary differential equation
$$
C_m \frac{\text{d} V_m(t)}{\text{d} t} = -\frac{V_m(t)}{R_m}+ I(t)
$$



## Simulation of spiking neural networks
Before dive into the theory, we really need a way to simulate the spiking neural network so that it can help us to gain insights and verify the theory. There are a lot of highly-developed simulation packages available such as [NEURON](https://neuron.yale.edu/neuron/), [Brain](https://briansimulator.org/), [GENESIS](http://genesis-sim.org/), [NEST](https://www.nest-simulator.org/) and so on. A comprehensive list can be found in this article {{< bibcite 2 >}} 


<div class="more-to-come">More to come...</div>


## References

{{< bibref 1 "Marian C.Diamond, Arnold B.Scheibel, Greer M. Murphy Jr. and Thomas Harvey" "On the brain of a scientist: Albert Einstein" "Experimental neurology," "88.1: 198-204, 1985." "https://www.sciencedirect.com/science/article/abs/pii/0014488685901232" >}}

{{< bibref 2 "Ruben A. Tikidji-Hamburyan, Vikram Narayana, Zeki Bozkus and Tarek A. El-Ghazawi" "Software for Brain Network Simulations: A Comparative Study" "Frontiers in neuroinformatics," "11, 46, 2017." "https://www.frontiersin.org/articles/10.3389/fninf.2017.00046/full" >}}
