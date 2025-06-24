import React from 'react'
import SavedHeader from '@/components/saved/SavedHeader'
import  SavedList,  { SavedData } from '@/components/saved/SavedList'

const savedItems: SavedData[] = [
  {
    // avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Red_Cross_logo.svg/1200px-Red_Cross_logo.svg.png',
    avatar: '/redcross.png',
    title: 'The Red Cross',
    subtitle: 'An health organization that…',
  },
  {
    // avatar: 'https://www.stjude.org/content/dam/en_US/shared/www/logos/st-jude-logo.png',
    avatar: '/grocery.jpg',
    title: 'St. Judes',
    subtitle: "The leading children's hea…",
  },
  {
    // avatar: 'https://www.whatlittlebirdie.com/wp-content/uploads/2021/09/atlanta-womens-healthcare.jpg',
    avatar: '/redcross.png',
    title: "Women's Healthcare of At…",
    subtitle: "We are Atlanta's #1 healthca…",
  },
];

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-white">
      <SavedHeader />
      <SavedList savedItems={savedItems} />
    </div>
  )
}
