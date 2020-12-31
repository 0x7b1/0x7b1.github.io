---
author: jc
title: Procedural Earthbending
summary: A game that explores the mechanics of VR by implementing a clever algorithm for procedural earhbending.
date: "2020-01-15"
series: ["projects"]
cover:
  image: "/covers/vr.png"
---

This project implements the mechanics of Earthbending in VR using Unreal Engine and C++. In the essence the Earthbending is a way to interact with the ground. Our goal is to design an algorithm and figure out controls of earthbending magic. In the most abstract blueprint the task consists of procedural mesh editing and VR technology integration.

## Game style
The first idea that came was the game style. It had to be presented in a way that does not require a powerful machine to run complex geometries and fancy effects because we have the limitations of the Oculus Quest device. For this we came with the idea of low poly style. This implied to have meshes with minimum geometry complexity and straightforward texturing. Besides, low poly should allow us to design the level and make changes quicker. Also low poly looks great with proper shading as these examples.

![gamestyle](https://i.ibb.co/rx4q1RJ/5970-big.jpg)

## Game design
The game mechanics played a huge role on the proyect. As initially said, we had the idea of providing the experience of playing with the earthbending effect. We thought that would be great to make it on a VR experience. Then, shaping it into a more game looking experience we designed a game map that compasses the levels, enemies and goals that a proper game should have. This is how the initial game map idea looked like

![gamedeisng](https://i.ibb.co/Tkvkjhf/1.png)

As it can be seen, is basically a platform game that requires to the user to climb level by level to reach the highest point and win. Each level is composed by one or many islands in which the enemies are spawned to interrupt and attack the player. Then after getting some great 3d assets from here and here the task was now to build the actual game map. After many hours of level design we got this.

![side1](https://i.ibb.co/YRBG2Mh/final-side.png)

![side2](https://i.ibb.co/p0N1CKq/final-side-b.png)

![side3](https://i.ibb.co/NLRMFfT/final-perspective.png)

## Game characters
We also needed to get or build actors in the game. For this purpose we got assets to make the game more playable.

### Enemies
We have enemies that have the role of blocking the path of the main player character. Each enemy has the same defined behavior: patrol the island, look for the player, attack and die. This is the list of complete enemy actors.

![enemies](https://i.ibb.co/M5J5741/Preview.png)

### Main Game Player
The player is the main actor. It is spawned on the first level and hast the goal to reach the highest level. The player has defined interactions that will be described below. Worth to note that we were developing for two types of view player. As First Person Shooter and as VR Person. The first one mainly for developing purposes and the other for the real game interaction. This came with tradeofs to put more effort into one and to take the time to implement more logic into the other. As this is a lesson learned, it will be detailed later.

![mainplayer](https://i.ibb.co/pJy4qvL/vrplayer.png)

### VR integration
Oculus Quest was the VR headset of choice because it offers a standalone experience with no extra wires while you are playing. This comes with a cost - a running power. For that extent the natural way to proceed was first to test some applications and some demos testing out the complexity and capacity of the device because in every VR immersion we don't want to experience lag in the game. The first step was to choose of the right tool for developing the game. The obvious options that comes to one's mind is between Unity and Unreal Engine. The task was to explore which of them provides less friction in the integration of VR and the game. Both tools provide good documentation and plugins to work with VR right away but we ultimately pick Unreal Engine because of the ease of prototyping cases, the graphics, and the fact that it works with C++. Here is a basic integration in both softwares showing the mapping between the character's hand and the controls.

Then, the task was concerned to bring some interaction into the scene. At first, a quick placement of objects with integrated physics was made to be sure they act fluidly once deployed into the headset. It turned out that when the build process started it took quite a long time to get finally into the Quest (like 1hr) because it was required to compile the shaders, build the lights, build the scene, build everything in an android-like package and then it was ready to be tried out. Some time was spent trying to test corner-cases when potentially the physics could break but none were found. Next build and deployment time was faster. Adding more polygons and more complex objects seemed to be ok with this experiment.

The next steps were to make the graphics scene of the game, integrate the control buttons to interact with the polygons and area of the floor to have the Earthbending effect. After that the path was to make this more immersive with grain-defined interactions and gameplay. More of the code and blueprints are at the repository.

## Gameplay
## Teleportation
Each island can be navigable by the player and the enemy. For doing this, the user has to press and maintain the A button of the VR Control to point into the desired destination and release the button in order to teleport. This was modified to work only on the right hand.

![teleportation](https://s5.gifyu.com/images/teleport4c6bc9b1528d16da.gif)

## Climbing
To step up into the next level island the player has to climb the ladder that is located near the edge of the last island. The user has to reach the highest point and realease the grabbing and landing into the next level in which again should have to reach the next ladder. For making this feature possible, a complete understanding of the VR Motion Controller implementation was required (this was also useful later to implement the bending). The climbing was implemented to work on both hands by pressing the backside trigger of the control.

![climbing](https://s5.gifyu.com/images/climbing.gif)

## Patrolling
The enemy is an implemented NPC with basic AI rules. On each level has predefined points what will serve to go from one to another to mimic the behaviour of defending a zone. When the enemy is being distracted or it senses the Player within the defined area, it chases for him.

![patrolling](https://s5.gifyu.com/images/patrolling.gif)

![patrolling-2](https://s5.gifyu.com/images/aidebug.gif)

## Attacking
The player has te ability to attack by bending (defined bellow) and shooting (from FPS view). The enemy attacks by getting close to the player and hitting straight to to the player position. When the player gets far from the enemy, this has the predefined behaviour of following to chase and keeping attack if the player is still within the range.

![attacking](https://s5.gifyu.com/images/attacking.gif)

## Bending
The main player has te ability to attack by bending the terrain of the island in which is currently standing. It makes damage to the enemy when the enemy is in the area of attack.

![bending1](https://s5.gifyu.com/images/bending.gif)

![bending2](https://s5.gifyu.com/images/bending2.gif)

## Conclusions
We faced many challenges along this journey. We first had to get familiar with the engine and the blueprint terminology. Then the implementation was something that iterated a lot. First with the initial idea of terrain blending by modifying vertex on runtime was not a trivial task. Then we implemented using material behaviour and we got an appealing result. Also implementing for VR was challenging from the first moment. The controlls, the mechanics and optimizations were subjects to be concerned on each stage.

## Links
- [Source code](https://github.com/michaelnitsenko/earthbending)
