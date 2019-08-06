import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"
import React from 'react'

Enzyme.configure({ adapter: new Adapter() })

// const setStateSpy = jest.fn()
// const useStateSpy = jest.spyOn(React, 'useState')
// useStateSpy.mockImplementation((init?) => [init, setStateSpy])

// export { setStateSpy, useStateSpy }