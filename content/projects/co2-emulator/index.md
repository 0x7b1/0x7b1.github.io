---
author: jc
title: CO2 Emission Simulator
summary: Given a simulated vahicle traffic on different cities, this app allows you to visualize the levels of CO2 emmited.and configuration files.
date: "2019-10-17"
series: ["projects"]
showTOC: true
math: true
cover:
  image: "/covers/co2.png"
---

{{< math.inline >}}
{{ if or .Page.Params.math .Site.Params.math }}
<!-- KaTeX -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>
{{ end }}
{{</ math.inline >}}

Traffic CO2 emission is a constant problem that have an impact into the environment. There are proposed solutions that improve the traffic analysis and operation performance to reduce traffic congestion and increase overall safety. However, these solutions have become increasingly complex due to the inclusion of multiple tools for treating the traffic management at a realistic manner. Emission models, that represent a separate complex task on its own, have been introduced in these systems making them even more difficult to scale. ITS needs to have easy and effective mechanisms for interacting with the existing vehicle infrastructure and be able to accomplish one task right. This project explores the implementation of a system that focuses on the gathering and calculation of CO2 emissions of urban vehicle traffic. The system presented is a cloud-based infrastructure that has been tested using different simulation scenarios with the objective of provide realistic urban traffic behaviour. The work also looks at the value of having a wide range of perspectives to evaluate transport pollution based on the existing retrieved information.

## Simulator

The purpose of this simulator is to calculate the emissions caused by a connected urban car traffic in real-time though a web system interface.

{{< figure src="images/diagram1.png#center" width="70%" title="Components of the system" >}}

### System Components

The presented system relies on connected devices representing the vehicles.

#### Devices

The system will collect data from a set of connected devices. These devices may not be able to report successfully at the desired rate due to intermittent connectivity. Additionally, this reported data contains a certain rate of error.

#### Storage

Storage Data collected by devices store the current state of the device entities. They are processed before being stored. The data is also stored for current and future analysis.

#### Controller

The system operates with a controller that acts on the input from devices in real-time. Then the data is stored and preprocessed into the storage component. The controller is also used to retrieve data for the Web client application.

#### Monitoring

The processed data is displayed in a web component that contains tools for visualization. This operates by collecting up and grouping the data of the storage component.

## Implementation

{{< figure src="images/diagram2.jpg#center" width="70%" title="System components of the simulated implementation" >}}

The back-end application acts as the message gateway by providing communication over HTTP and potentially over the MQTT protocol. Then, a time-series database, namely InfluxDB, is used to storage received messages as a real time telemetry of vehicles. Data from traffic is published to a common data channel into a stream end-point. Vehicles emit messages to the controller containing the entity id, speed, latitude, longitude, and acceleration. The messages are processed by a function that calculates the emission based on these attributes. It is then possible for the emission to be calculated concurrently. This ensures multiple evaluations while ensuring processing in real time.

### CO2 Simulation

An exact and efficient calculation of CO2 emissions depend on many different factors, such as the model of the vehicle, year of fabrication, fuel, engine specifics and other technological features. A good overview of the standard emission methods for vehicle emissions can be seen here. The proposed system uses a microscopic approach of simulation, in which each vehicle hast its own representation. Individual vehicle characteristics may include factors such as vehicle type, weight, speed, acceleration, engine performance, between others. So the level of detail is even higher at sub-microscopic models. They can include vehicle shifting, steering, fuel consumption and so on. Regarding of any type of model, emission can be attained into each flow model. For this reason, the microscopic modeling is used because it helps to calculate the emission of CO2 of passenger vehicles.

The method of this paper uses the following definition for the estimated emissions to approximate the generated CO2 emissions as defined by:

$$
P = c_0 + c_1va + c_2va^2 + c_3v + c_4v^2 + c_5v^3
$$

{{< math.inline >}}

where \(P\) is the emission frequency (in miligrams persecond), c are the emission constants, v is the vehicle’s speed in m/s, and a is the acceleration in \(m/s^2\).
For this experiment we are going to use the constants \(9449, 938.4, 0.0, −467.1, 28.26, 0.0\).

{{</ math.inline >}}

A heat-map generally visualizes data intensity at geographic points. As it is shown in the next figure we can navigate and zoom through the polluted areas.

{{< figure src="images/app1.jpg#center" title="Web application in live mode showing the trace of the vehicles as they come" >}}

{{< figure src="images/app2.jpg#center" title="On history mode the option for filtering and showing the layers is available" >}}

## Evaluation

We need a framework to run the simulated agents into a network to make realistic trips that also could provide a test environment. For this, we need to define a network representation of a road network. Using SUMO to make a real-world scenario from scratch is time consuming as one needs to define and constantly tweak every single detail of the network road. We could use the integrated SUMO tools that speed up this process, such as defining a network based on a realistic map from OpenStreetMap.

With this described setup, the simulation in ready to run. First the baseline scenario is executed, then it is followed by the Monaco scenario. The simulated data gives a good insight on how this could operate in a real life. Running the scenarios for few moments one can observe the large number of entries and hits in the database. This became a problem when a query was needed to process to keep flexibility. Fortunately InfluxDB allows to group and aggregate in order gain some performance.

{{< figure src="images/map1.png#center" title=" Baseline map on a small area in the city of Tartu" >}}

{{< figure src="images/map2.png#center" title="Monaco SUMO Traffic (MoST)" >}}

An experiment ran for 50 minutes. On both cases we can see the emitted CO2 in the heat-map layer. This is modified over time to fit the real-time behavior. As we scale the view with zoom in and out the aggregation is being modified.

### Results

Based on the experiment described on the previous sections, this section discusses the obtained results, the benefits of this approach, and its limitations. Testing the first scenario revealed problems on the web application that were not addressed while initially was being developed. This needed improvement in the code for displaying correctly the emissions over time. Another improvement was the code for the calculation of CO2, as the initial implementation of emission did not yield appealing results. The code for the query of the database was also a thing to consider in this regard. In parallel, debugging and running the scenarios on the SUMO graphical interface was crucial to keep the constant feedback.

{{< figure src="images/map_speeds_tartu_1.png#center" width="70%" title="Plot of speed on the Tartu scenario" >}}

In terms of CO2 emission calculation, it was compared with the SUMO built-in emission model HBEFA v.2.1 which considers parameters of vehicle such velocity and acceleration. In order to evaluate both under same conditions, the test was run on the same scenarios. A quantitative estimation is used to compare both models. According to the figure 11 the SUMO model generates 5643334 mg of CO2 emission, while the method of this paper gets 5643443 mg. On the second scenario the SUMO model generates 8554854mg of CO2 emission, while the method of this paper gets 7454854 mg.

{{< figure src="images/monaco_emissions_plot.png#center" width="70%" title="SUMO CO2 values vs own implementation shows a mean error or 15% on MoST scenario" >}}

It is always discussed in the ITS traffic literature that electric cars emit less emission than old traditional cars. This is a consideration and improvement that could be added to a new version of the system. We could also add more pollutants based on vehicle and environment parameters. Also a point to consider is the realistic representation of a city because if we were to run on it we could make better decisions in terms of ITS policies. Note, that this system was only concerned with CO2 emissions and its applicability to the existing devices (i.e. mobile phones) into a visualization tool taking into consideration its reliability through a distributed approach. The ultimate goal of this kind of simulations is to make effect on improving the environment quality.

## Conclusions

With an increasing number of connected vehicles on the road, traffic congestion has become a daily problem affecting several aspects of modern society. One of the problems of traffic that concerns more to the environment is the pollution through the CO2 emission. We also have noticed that nowadays we have an scenario of vehicle drivers somehow connected to a cloud service, this can be leveraged to use them in order to get estimation of CO2 emission into the current state of traffic. A system was proposed to fulfill this requirement. It was discussed the necessity for building a solution and why it should be developed in a distributed way. Hopefully the visualization tool provides an insight in the decision making of ITS policies.

## Links
- [Source code](https://github.com/0x7b1/co2-emission-simulator)
