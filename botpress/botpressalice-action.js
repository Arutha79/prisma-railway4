const axios = require('axios')

module.exports = async bp => {
  bp.dialogEngine.registerActions({
    async interactWithAlice(state, event) {
      try {
        const { data } = await axios.post('http://localhost:3000/api/interact', {
          prompt: event.text,
          sender: event.user.id
        })
        const reply = data.gpt_4 || data.gpt_3_5
        await bp.events.replyToEvent(event, [{ type: 'text', text: reply }])
      } catch (err) {
        await bp.events.replyToEvent(event, [{ type: 'text', text: `Erreur: ${err.message}` }])
      }
      return state
    }
  })
}
