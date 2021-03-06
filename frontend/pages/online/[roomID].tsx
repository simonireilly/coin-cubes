import { NextPage } from 'next'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import Room from '../../page-components/room'
import { RoomServiceProvider } from '@roomservice/react'

const RoomId: NextPage = () => {
  const [session, loading] = useSession()
  const router = useRouter()
  const { roomID } = router.query
  const sanitizedRoomId = String(roomID)

  if (loading) return null
  if (!loading && !session)
    return (
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <h1>This isn&apos;t your room!</h1>
        <Link href="/" passHref>
          <button className="button">Back to Lobby</button>
        </Link>
        <p>Lets see if we can find somewhere for you</p>
      </main>
    )

  return (
    // TODO: Replace with our own room provider
    <RoomServiceProvider clientParameters={{ auth: '/api/roomservice' }}>
      <Room roomID={sanitizedRoomId} />
    </RoomServiceProvider>
  )
}
export default RoomId
