import React from 'react'
import { useSelector } from 'react-redux'

const Home = () => {

    const userData = useSelector((store)=> store.user)

  return (
    <div>
        <h1>{userData.userName}</h1>
    </div>
  )
}

export default Home