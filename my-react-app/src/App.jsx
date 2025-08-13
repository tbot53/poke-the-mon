import React, { useEffect, useState } from 'react'

const LIMIT = 10

const App = () => {
  const [pokemons, setPokemons] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  async function pokemonFetch(currentOffset = 0) {
    setLoading(true)
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${currentOffset}`)
    const data = await res.json()

    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon) => {
        const pokeRes = await fetch(pokemon.url)
        const pokeData = await pokeRes.json()
        const speciesRes = await fetch(pokeData.species.url)
        const speciesData = await speciesRes.json()
        const descriptionObj = speciesData.flavor_text_entries.find(
          entry => entry.language.name === 'en'
        )
        const description = descriptionObj ? descriptionObj.flavor_text : 'No description.'
        return {
          name: pokeData.name,
          image: pokeData.sprites.front_default,
          description
        }
      })
    )
    setPokemons(prev => [...prev, ...pokemonDetails])
    setLoading(false)
  }

  async function searchPokemon(e) {
    e.preventDefault()
    if (!search.trim()) {
      // If search is empty, reload the default list
      setPokemons([])
      setOffset(0)
      pokemonFetch(0)
      setOffset(LIMIT)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`)
      if (!res.ok) throw new Error('Not found')
      const pokeData = await res.json()
      const speciesRes = await fetch(pokeData.species.url)
      const speciesData = await speciesRes.json()
      const descriptionObj = speciesData.flavor_text_entries.find(
        entry => entry.language.name === 'en'
      )
      const description = descriptionObj ? descriptionObj.flavor_text : 'No description.'
      setPokemons([{
        name: pokeData.name,
        image: pokeData.sprites.front_default,
        description
      }])
      setOffset(0)
    } catch {
      setPokemons([])
    }
    setLoading(false)
  }

  useEffect(() => {
    pokemonFetch(0)
    setOffset(LIMIT)
  }, [])

  const handleLoadMore = () => {
    pokemonFetch(offset)
    setOffset(prev => prev + LIMIT)
  }

  return (
    <>
      <header className='bg-sky-200 text-2xl text-sky-900 px-2 py-4 fixed w-full top-0 left-0 overflow-x-hidden' >
        <h1 className='text-center font-extrabold text-3xl header-title'>Poke The Mon</h1>
      </header>
      <main className='p-4 bg-slate-100 min-h-screen overflow-x-hidden mt-16'>
        <form onSubmit={searchPokemon} className='grid grid-cols-1 gap-2 pb-6'>
          <label htmlFor="site-search" className="text-slate-700">Enter the pokemon name here:</label>
          <div>
            <input
              type="search"
              id="site-search"
              name="q"
              placeholder="Pikachu"
              className='border-2 border-sky-300 focus:border-sky-400 rounded-lg h-10 px-2 py-2 w-[70%] bg-white text-slate-700'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className='bg-sky-400 hover:bg-sky-300 text-white w-[20%] rounded-lg h-10 ml-2 transition'>Search</button>
          </div>
        </form>
        <ul className='w-[80vw] mx-auto border-2 border-sky-200 p-4 grid grid-cols-1 md:grid-cols-4 bg-white rounded-lg shadow'>
          {pokemons.map((pokemon, idx) => (
            <li key={idx} className='h-[65vh] w-[90%] border-2 border-pink-200 flex flex-col mb-4 bg-white rounded-lg shadow'>
              <div className='w-full h-[65%] border-sky-100 border-2 flex items-center justify-center bg-slate-50 rounded-t-lg'>
                <img src={pokemon.image} alt={pokemon.name} className='w-full h-full object-contain'/>
              </div>
              <div className='w-full h-[35%] border-sky-100 border-2 p-2 rounded-b-lg'>
                <h2 className='text-xl capitalize text-slate-700'>{pokemon.name}</h2>
                <p className='text-sm text-slate-500'>{pokemon.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className='p-6 w-[80vw] mx-auto'>
          <button
            className='text-white bg-sky-400 hover:bg-sky-300 text-xl rounded-lg px-4 py-2 transition w-[100%] text-center md:text-2xl md:font-bold'
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      </main>
    </>
  )
}

export default App