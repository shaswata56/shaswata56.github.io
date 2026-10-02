import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBed,
  faBlog,
  faBullseye,
  faClone,
  faCode,
  faDice,
  faEnvelope,
  faFilePdf,
  faGamepad,
  faLocationDot,
  faMoon,
  faPersonBiking,
  faPersonHiking,
  faSailboat,
  faSun,
  faWater,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// Register only the icons the site uses — importing the whole `fas`/`fab` packs
// ships ~3,000 icons (>1 MB of JS). Add new icons to this list when you use them.
library.add(
  faBed,
  faBlog,
  faBullseye,
  faClone,
  faCode,
  faDice,
  faEnvelope,
  faFilePdf,
  faGamepad,
  faLocationDot,
  faMoon,
  faPersonBiking,
  faPersonHiking,
  faSailboat,
  faSun,
  faWater,
  faGithub,
  faLinkedin,
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})
