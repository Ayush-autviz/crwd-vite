import React from 'react'
import ProfileActivity from '../profile/ProfileActivity'
import { profileActivity } from '@/lib/profile/profileActivity'

export default function CommunityGuideLines() {
  return (
    <section className=' border-t border-gray-200'>
        {/* <h1 className='text-2xl px-6 py-4'>Community Updates</h1> */}
        <div className='p-4'>
        <ProfileActivity
        posts={profileActivity}
        />  
        </div>
    </section>
  )
}
