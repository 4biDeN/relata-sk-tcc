import { boot } from 'quasar/wrappers'
import { Quasar } from 'quasar'
import langPtBr from 'quasar/lang/pt-BR'

export default boot(() => {
  Quasar.lang.set(langPtBr)
})
