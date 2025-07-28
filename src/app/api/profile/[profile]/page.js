import PostProduct from '@/app/post/postProduct'
import React from 'react'
//get current user from state observer listener onauthstatechanged firebase, save in top global state, single truth, no challengers throughout the kingdom, one top truth, avoid s
//save current user from state listener firebase authentication state change firebase, add to global state
//1. Create a Context:
//Use React.createContext() to create a context object. This object will hold the data you want to share.


export const page = () => {
  return (
    <div>Current user



<div>
  <h2>Post Product:</h2>
  <PostProduct/>
  </div>
    </div>
  )
}
