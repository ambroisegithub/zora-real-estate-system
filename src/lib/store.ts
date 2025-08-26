import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/auth/auth-slice"
import propertiesReducer from "./features/auth/PropertiesSlice"
import servicesReducer from "./features/auth/ServiceSlice"
import ContactUsReducer from "./features/auth/ContactUsSlice"
    
import jobReducer from './features/auth/jobSlice'
import jobApplicationReducer from './features/auth/jobApplicationSlice'
import newsletterReducer from './features/auth/newsletterSlice'


export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      properties: propertiesReducer,
      services: servicesReducer,
      contactUs: ContactUsReducer,
      jobs: jobReducer,
     jobApplications: jobApplicationReducer,
     newsletter: newsletterReducer,



    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
