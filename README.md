


CS 174A Preliminary Project Proposal

Team Name: localhost:8000

Wonhee Lee 
wonheel1@g.ucla.edu
krwhlee15
905284414

SooHyun Mun
suhyunmoon1998@g.ucla.edu
suhyunmoon1998
305784886

Lily Takahari
lilytakahari@gmail.com
lilytakahari
305 108 348



We intend to create a single-player version of a minigame from Pummel Party: https://youtu.be/ZsqXFdsh3UA?t=68. The goal of the game is to navigate a maze-like path without falling off and while the path is completely dark. There are sources of light scattered throughout the maze that only illuminate a certain radius of the path around them. At constant intervals of time, the whole path will be illuminated for a short time, at which point the player should memorize the path to their best ability so that they can continue through the maze when it is dark. 

The player is given 3 lives. The player loses a life when they fall off the path; the game ends if the player loses all lives and the player receives no score. If the player successfully reaches the end, they are given a score. They are awarded more points the faster they make it through the maze and for losing fewer lives. We may also add a time limit such that no matter how many lives the player has, if the time runs out, the game ends.

Currently, we intend that the representation of the player in the maze will be a rolling ball as opposed to the human avatar shown in the screenshots. The camera will follow the player in a third-person perspective, looking forward and from above.
User Interaction
The user navigates through the maze with the WASD keys corresponding to forward, left, right, and backward. Other keys may also be added for additional game controls, e.g. Enter to Continue or Restart, P for pause.

Technical Features
We will implement the advanced graphics feature of collision detection, such that we are actually detecting the absence of collision of the player with the path, causing the player to fall and die.

Another advanced graphics feature (we presume) is the lighting of the path, especially when the light is restricted to a certain radius.

We additionally need to add textures so that the user can tell which way their ball is rolling and to add visual detail to the game e.g. brick walls.
Stretch Goals
Use a humanoid model and running animation for the player instead of using a rolling ball.
Randomly generate maze levels; Then we can make the game more replayable by letting the user generate new maps OR we can make the gameplay itself infinite. 
We define a new goal for the infinite game: Complete as many levels (of constant size), while the time limit for each level decreases gradually.
We can create an “item to pick up” that gives the player an extra life when they collide with it. We similarly randomly generate the locations of this object in the map.
Add momentum (physics modeling) to the rolling ball/running player. Make the falling animation reflect gravity.







