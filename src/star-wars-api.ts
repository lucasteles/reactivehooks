import Axios from  'axios-observable';
import { map, share  } from 'rxjs/operators'

export interface StarWarsPerson {
  name: string
  mass: string
}

export interface StarWarApiPeopleResult {
  results: ReadonlyArray<StarWarsPerson>
}

const getUrl = (name: string) => `https://swapi.co/api/people/?format=json&search=${name}`

const searchStarWarsPeople = (name: string) =>
      Axios.get<StarWarApiPeopleResult>(getUrl(name))
      .pipe(
        map(x => x.data),
        map(x => x.results),
        share(),
      )

export { searchStarWarsPeople  }