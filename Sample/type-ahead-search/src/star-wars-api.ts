import { map, share } from 'rxjs/operators'
import { fetchJson } from 'reactivehooks'

export interface StarWarsPerson {
  name: string
  mass: string
}

export interface StarWarApiPeopleResult {
  results: ReadonlyArray<StarWarsPerson>
}

const getUrl = (name: string) => `https://swapi.co/api/people/?format=json&search=${name}`

const searchStarWarsPeople = (name: string) =>
      fetchJson<StarWarApiPeopleResult>(getUrl(name))
      .pipe(
        map(x => x.results),
        share(),
      )

export { searchStarWarsPeople }