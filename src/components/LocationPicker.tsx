'use client'

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useState } from 'react'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 21.5433,
  lng: 39.1728
}

export default function LocationPicker({ onSelect }: any) {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  const [marker, setMarker] = useState<any>(null)
  const [locationData, setLocationData] = useState<any>(null)

  const handleClick = (event: any) => {

    const lat = event.latLng.lat()
    const lng = event.latLng.lng()

    setMarker({ lat, lng })

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    )

    const request = {
      location: new google.maps.LatLng(lat, lng),
      radius: 50
    }

    service.nearbySearch(request, (results, status) => {

      if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {

        const place = results[0]

        const location = {
          lat,
          lng,
          address: place.vicinity || '',
          city: ''
        }

        console.log("Map Selected:", location)

        setLocationData(location)

      }

    })

  }

  const confirmLocation = () => {

    if (!locationData) return

    console.log("Confirmed:", locationData)

    onSelect(locationData)

  }

  if (!isLoaded) return <div>Loading Map...</div>

  return (

    <div className="space-y-4">

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={12}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      {marker && (
        <button
          type="button"
          onClick={confirmLocation}
          className="block w-full text-center bg-black text-blue py-4 rounded-lg font-extrabold shadow-md hover:shadow-lg hover:-translate-y-1 hover:bg-gray-900 transition-all duration-300"
        >
          Confirm Location
        </button>
      )}

      {locationData && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>Address:</strong> {locationData.address}</p>
        </div>
      )}

    </div>

  )
}