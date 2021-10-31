/**
 * Our room service providers
 *
 * The provider handles authentication for the session ensuring that every child
 * in the tree has the same context of the currently authenticated user
 *
 * We may find that this provider is the best place to create instances of the
 * hooks, so that they have access to an internal state from the provider
 *
 * - Store auth state of user
 *
 * <RoomServiceProvider clientParameters={{ auth: '/api/roomservice' }}>
 * </RoomServiceProvider>
 */
export const RoomServiceProvider = () => {}

/**
 * A map is a distributed hash map. Changes to the map are applied locally, then
 * applied across the network.
 *
 * The map is named e.g. 'coin' and that creates a hash map for the room. Rooms
 * can have many maps.
 *
 * You can fill the has map 'coin' with keys and values.
 *
 * const [coin, map] = useMap(roomID, 'coin')
 *
 * ...
 *
 *  if (!coin?.position) {
 *    map?.set('position', {
 *      x: 100,
 *      y: 100,
 *    })
 *  }
 */
export const useMap = () => {}

/**
 * Use presence hook should be able to return the data for all users in the
 * given room.
 *
 * Its mutation function should enable the local user to send the data about
 * their current location in the room.
 *
 * const [players, setMyPlayer] = usePresence<Player>(roomID, 'players')
 *
 * ...
 *
 *  useEffect(() => {
 *    if (!players) return
 *
 *    setMyPlayer.set({
 *      x: left.toString(),
 *      y: top.toString(),
 *      name: name,
 *      score: score,
 *    })
 *  }, [left, top, name])
 */
export const usePresence = () => {}
