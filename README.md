# virtual black rock city


# backend
There is no real backend with a database. All data is just stored on the player side.
If a player does not move for more than 1400 ms, the client will receive a "ping" upon which they should send their entire data.
If the player just moves normally, they should also send their information which will be forwarded to other players. Thus, the timeout will be reset.
The only datapoint which is checked is the player id. Everything else is forwarded verbatim.

There are only these messages to the client:

* `init`: will only contain the player id the particular player has. Will only be sent once at connection initialisation
* `player`: contains player data
  * `id`: the id of the player
  * `x`, `y`: the location of the player
  * `name`: the name of the player
  * `msg`: the current message of the player