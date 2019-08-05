import { map, share, switchMap  } from 'rxjs/operators'
import { fromFetch } from 'rxjs/fetch'
import { fetchJson } from './rx-hooks';

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