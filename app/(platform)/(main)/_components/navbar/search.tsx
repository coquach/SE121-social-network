'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export const Search = () => {
  return (
    <form onSubmit={() => {}} className='relative  flex items-center'>
      <Input
        placeholder='Search'
        className=' lg:w-[200px] hidden h-8.5 lg:flex pl-4 py-2 pr-12  rounded-r-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0'
      />
      <Button
        type='submit'
        size='sm'
        variant='secondary'
        className='lg:rounded-l-none lg:px-5 size-8.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <SearchIcon className='h-5 w-5 text-muted-foreground' />
      </Button>
    </form>
  );
}