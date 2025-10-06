'use client'

import { useState } from 'react'

import Image from 'next/image'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCountries, type Country } from '@/lib/data'

export const Address = () => {
  const countries = getCountries()
  const [country, setCountry] = useState<Country>(() => {
    const firstCountry = countries[0]
    if (!firstCountry) {
      throw new Error('No countries available')
    }
    return firstCountry
  })
  const [region, setRegion] = useState<string>('Ontario')

  return (
    <div className="grid grid-cols-2 gap-6">
      <Input
        aria-label="Street Address"
        name="address"
        placeholder="Street Address"
        defaultValue="147 Catalyst Ave"
        className="col-span-2"
      />
      <Input aria-label="City" name="city" placeholder="City" defaultValue="Toronto" className="col-span-2" />
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger aria-label="Region">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {country.regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input aria-label="Postal code" name="postal_code" placeholder="Postal Code" defaultValue="A1A 1A1" />
      <Select value={country.code} onValueChange={(code) => {
        const newCountry = countries.find(c => c.code === code)
        if (newCountry) setCountry(newCountry)
      }}>
        <SelectTrigger aria-label="Country" className="col-span-2">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <Image
                  className="w-5 sm:w-4 object-cover"
                  src={country.flagUrl}
                  alt={`${country.name} flag`}
                  width={20}
                  height={15}
                />
                {country.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
