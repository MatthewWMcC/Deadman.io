# deadman.io

Written with js and run on an express server utilizing socket.io to make connections between all players. Players can join their friends in private rooms using auto generated room codes.

<br>

A fun twist on an old classic. This Hangman spinoff is based on an aged astronaut who ventures into a strange wormhole. When he comes out on the other side he finds that his body is slowly disappearing. Its up to you and your friends to save him with the power of words... will you be able to do it? Or will he be lost to the stars forever. Hop on to compete against friends [here](https://dead-man.herokuapp.com) and try it for yourself.

<br>

The gameplay flow is:  
    - one player in the lobby takes their turn to generate a new phrase for their friends to decypher  
    - then everyone else gets a chance to guess a letter or take a crack at the phrase  
    - correctly guessed letters will earn you a point for each time it appears, but guess incorrectly and the astronaut will lose one of his 6 core body parts  
    - if you guess at the phrase and get it right you'll earn 5 points, but there is a steep penalty for incorrect guesses with such a bold maneuver; you'll lose 2 points, so be careful!  
    - The turn ends when either the whole phrase has been spelled out or the astronaut is gone for good, and the phrase maker earns 4 points.  