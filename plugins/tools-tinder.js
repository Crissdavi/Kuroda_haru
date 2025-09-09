let handler = async (m, { conn, usedPrefix, command, args }) => {
  // Estructura de datos para el sistema Tinder
  if (!global.db.data.tinder) global.db.data.tinder = {
    users: {},
    likes: {},
    matches: {}
  }
  
  const tinder = global.db.data.tinder
  const user = global.db.data.users[m.sender]
  
  // Subcomandos disponibles
  const subCommands = {
    // Crear perfil de Tinder
    create: async () => {
      if (tinder.users[m.sender]) {
        return conn.reply(m.chat, '❌ Ya tienes un perfil de Tinder creado. Usa *' + usedPrefix + 'tinder edit* para modificarlo.', m)
      }
      
      if (!args[1]) {
        return conn.reply(m.chat, `💝 *CREAR PERFIL TINDER*\n\nUsa: ${usedPrefix + command} create [tu nombre] | [edad] | [género] | [intereses]\n\nEjemplo: ${usedPrefix + command} create María | 25 | Mujer | Música, Películas, Viajes`, m)
      }
      
      const profileData = args.slice(1).join(' ').split('|').map(item => item.trim())
      if (profileData.length < 4) {
        return conn.reply(m.chat, `❌ Formato incorrecto. Usa: ${usedPrefix + command} create [nombre] | [edad] | [género] | [intereses]`, m)
      }
      
      const [name, age, gender, interests] = profileData
      
      // Validar edad
      if (isNaN(age) || age < 18 || age > 100) {
        return conn.reply(m.chat, '❌ La edad debe ser un número entre 18 y 100 años.', m)
      }
      
      // Crear perfil
      tinder.users[m.sender] = {
        id: m.sender,
        name: name,
        age: parseInt(age),
        gender: gender,
        interests: interests,
        bio: '', // Se puede añadir luego
        photos: [], // Array para fotos
        createdAt: new Date().getTime(),
        likes: 0,
        dislikes: 0,
        matches: 0
      }
      
      conn.reply(m.chat, `✅ *Perfil de Tinder creado exitosamente!*\n\n👤 Nombre: ${name}\n🎂 Edad: ${age}\n👫 Género: ${gender}\n🎯 Intereses: ${interests}\n\nUsa *${usedPrefix + command} edit* para añadir más información o fotos.`, m)
    },
    
    // Editar perfil
    edit: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder. Usa *${usedPrefix + command} create* para crear uno.`, m)
      }
      
      if (!args[1]) {
        const profile = tinder.users[m.sender]
        let text = `💝 *EDITAR PERFIL TINDER*\n\n`
        text += `👤 Nombre: ${profile.name}\n`
        text += `🎂 Edad: ${profile.age}\n`
        text += `👫 Género: ${profile.gender}\n`
        text += `🎯 Intereses: ${profile.interests}\n`
        text += `📝 Bio: ${profile.bio || 'No establecida'}\n`
        text += `🖼️ Fotos: ${profile.photos.length}\n\n`
        text += `Opciones de edición:\n`
        text += `• ${usedPrefix + command} edit name [nuevo nombre]\n`
        text += `• ${usedPrefix + command} edit age [nueva edad]\n`
        text += `• ${usedPrefix + command} edit gender [nuevo género]\n`
        text += `• ${usedPrefix + command} edit interests [nuevos intereses]\n`
        text += `• ${usedPrefix + command} edit bio [nueva bio]\n`
        text += `• ${usedPrefix + command} addphoto [responder a una imagen]\n`
        
        return conn.reply(m.chat, text, m)
      }
      
      const editType = args[1].toLowerCase()
      const value = args.slice(2).join(' ')
      
      if (!value) {
        return conn.reply(m.chat, `❌ Debes proporcionar un valor para ${editType}.`, m)
      }
      
      switch (editType) {
        case 'name':
          tinder.users[m.sender].name = value
          break
        case 'age':
          if (isNaN(value) || value < 18 || value > 100) {
            return conn.reply(m.chat, '❌ La edad debe ser un número entre 18 y 100 años.', m)
          }
          tinder.users[m.sender].age = parseInt(value)
          break
        case 'gender':
          tinder.users[m.sender].gender = value
          break
        case 'interests':
          tinder.users[m.sender].interests = value
          break
        case 'bio':
          tinder.users[m.sender].bio = value
          break
        default:
          return conn.reply(m.chat, `❌ Tipo de edición no válido. Usa: name, age, gender, interests o bio.`, m)
      }
      
      conn.reply(m.chat, `✅ Perfil actualizado correctamente. ${editType} cambiado a: ${value}`, m)
    },
    
    // Añadir foto al perfil
    addphoto: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder. Usa *${usedPrefix + command} create* para crear uno.`, m)
      }
      
      if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image/')) {
        return conn.reply(m.chat, '❌ Responde a una imagen para añadirla a tu perfil.', m)
      }
      
      // Limitar a 5 fotos máximo
      if (tinder.users[m.sender].photos.length >= 5) {
        return conn.reply(m.chat, '❌ Límite de fotos alcanzado (máximo 5).', m)
      }
      
      try {
        // Guardar la imagen (en un sistema real deberías guardarla en un servidor)
        const media = await m.quoted.download()
        // En un sistema real, aquí subirías la imagen a un servidor y guardarías la URL
        // Por simplicidad, solo guardamos un indicador de que tiene foto
        tinder.users[m.sender].photos.push(`photo_${tinder.users[m.sender].photos.length + 1}`)
        
        conn.reply(m.chat, `✅ Foto añadida correctamente. Ahora tienes ${tinder.users[m.sender].photos.length} fotos en tu perfil.`, m)
      } catch (e) {
        conn.reply(m.chat, '❌ Error al procesar la imagen.', m)
      }
    },
    
    // Buscar perfiles
    search: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder. Usa *${usedPrefix + command} create* para crear uno.`, m)
      }
      
      // Obtener todos los usuarios excepto el actual
      const allUsers = Object.values(tinder.users).filter(u => u.id !== m.sender)
      
      if (allUsers.length === 0) {
        return conn.reply(m.chat, '❌ No hay más perfiles disponibles en este momento. Vuelve más tarde.', m)
      }
      
      // Filtrar usuarios que aún no han sido calificados
      const currentUserLikes = tinder.likes[m.sender] || []
      const unseenUsers = allUsers.filter(u => !currentUserLikes.includes(u.id))
      
      if (unseenUsers.length === 0) {
        return conn.reply(m.chat, '❌ Has visto todos los perfiles disponibles. Vuelve más tarde para ver nuevos usuarios.', m)
      }
      
      // Seleccionar un usuario aleatorio
      const randomUser = unseenUsers[Math.floor(Math.random() * unseenUsers.length)]
      
      // Formatear la información del perfil
      let profileText = `💝 *PERFIL ENCONTRADO* 💝\n\n`
      profileText += `👤 Nombre: ${randomUser.name}\n`
      profileText += `🎂 Edad: ${randomUser.age}\n`
      profileText += `👫 Género: ${randomUser.gender}\n`
      profileText += `🎯 Intereses: ${randomUser.interests}\n`
      if (randomUser.bio) profileText += `📝 Bio: ${randomUser.bio}\n`
      profileText += `❤️ Likes: ${randomUser.likes} | 👎 Dislikes: ${randomUser.dislikes}\n\n`
      profileText += `*Reacciona con:*\n`
      profileText += `❤️ - *${usedPrefix + command} like* - Me gusta este perfil\n`
      profileText += `👎 - *${usedPrefix + command} dislike* - No me gusta\n`
      profileText += `➡️ - *${usedPrefix + command} skip* - Saltar este perfil\n\n`
      profileText += `*Para ver tu perfil:* ${usedPrefix + command} profile`
      
      // Guardar el último perfil visto para poder reaccionar
      user.lastTinderProfile = randomUser.id
      
      // Enviar el perfil (en un sistema real, incluirías las fotos)
      conn.reply(m.chat, profileText, m)
    },
    
    // Dar like a un perfil
    like: async () => {
      if (!user.lastTinderProfile) {
        return conn.reply(m.chat, '❌ Primero debes buscar un perfil con *' + usedPrefix + command + ' search*', m)
      }
      
      const likedUserId = user.lastTinderProfile
      
      // Registrar el like
      if (!tinder.likes[m.sender]) tinder.likes[m.sender] = []
      tinder.likes[m.sender].push(likedUserId)
      
      // Aumentar contador de likes del usuario likeado
      tinder.users[likedUserId].likes++
      
      // Verificar si es un match (si el otro usuario también te dio like)
      const otherUserLikes = tinder.likes[likedUserId] || []
      const isMatch = otherUserLikes.includes(m.sender)
      
      if (isMatch) {
        // Crear match
        if (!tinder.matches[m.sender]) tinder.matches[m.sender] = []
        if (!tinder.matches[likedUserId]) tinder.matches[likedUserId] = []
        
        tinder.matches[m.sender].push(likedUserId)
        tinder.matches[likedUserId].push(m.sender)
        
        // Aumentar contador de matches
        tinder.users[m.sender].matches++
        tinder.users[likedUserId].matches++
        
        // Notificar a ambos usuarios
        const matchMessage = `🎉 *¡MATCH!* 🎉\n\nHas hecho match con ${tinder.users[likedUserId].name}. ¡Ahora pueden conversar!\n\nUsa *${usedPrefix}chat* para iniciar una conversación.`
        conn.reply(m.chat, matchMessage, m)
        
        // También notificar al otro usuario si está activo
        // (En un sistema real, aquí enviarías un mensaje al otro usuario)
      } else {
        conn.reply(m.chat, `❤️ Le has dado like a ${tinder.users[likedUserId].name}. Si también te da like, ¡tendrán un match!`, m)
      }
      
      // Limpiar el último perfil visto
      user.lastTinderProfile = null
    },
    
    // Dar dislike a un perfil
    dislike: async () => {
      if (!user.lastTinderProfile) {
        return conn.reply(m.chat, '❌ Primero debes buscar un perfil con *' + usedPrefix + command + ' search*', m)
      }
      
      const dislikedUserId = user.lastTinderProfile
      
      // Registrar el dislike
      if (!tinder.likes[m.sender]) tinder.likes[m.sender] = []
      tinder.likes[m.sender].push(dislikedUserId)
      
      // Aumentar contador de dislikes del usuario
      tinder.users[dislikedUserId].dislikes++
      
      conn.reply(m.chat, `👎 Has rechazado a ${tinder.users[dislikedUserId].name}.`, m)
      
      // Limpiar el último perfil visto
      user.lastTinderProfile = null
    },
    
    // Saltar perfil
    skip: async () => {
      if (!user.lastTinderProfile) {
        return conn.reply(m.chat, '❌ Primero debes buscar un perfil con *' + usedPrefix + command + ' search*', m)
      }
      
      const skippedUserId = user.lastTinderProfile
      
      // Registrar como visto pero sin reacción
      if (!tinder.likes[m.sender]) tinder.likes[m.sender] = []
      tinder.likes[m.sender].push(skippedUserId)
      
      conn.reply(m.chat, `➡️ Has saltado el perfil de ${tinder.users[skippedUserId].name}.`, m)
      
      // Limpiar el último perfil visto
      user.lastTinderProfile = null
    },
    
    // Ver perfil propio
    profile: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder. Usa *${usedPrefix + command} create* para crear uno.`, m)
      }
      
      const profile = tinder.users[m.sender]
      let text = `💝 *TU PERFIL TINDER* 💝\n\n`
      text += `👤 Nombre: ${profile.name}\n`
      text += `🎂 Edad: ${profile.age}\n`
      text += `👫 Género: ${profile.gender}\n`
      text += `🎯 Intereses: ${profile.interests}\n`
      if (profile.bio) text += `📝 Bio: ${profile.bio}\n`
      text += `🖼️ Fotos: ${profile.photos.length}\n`
      text += `❤️ Likes recibidos: ${profile.likes}\n`
      text += `👎 Dislikes recibidos: ${profile.dislikes}\n`
      text += `💞 Matches: ${profile.matches}\n\n`
      text += `*Comandos útiles:*\n`
      text += `• ${usedPrefix + command} edit - Editar tu perfil\n`
      text += `• ${usedPrefix + command} search - Buscar personas\n`
      text += `• ${usedPrefix + command} matches - Ver tus matches\n`
      text += `• ${usedPrefix + command} delete - Eliminar tu perfil`
      
      conn.reply(m.chat, text, m)
    },
    
    // Ver matches
    matches: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder. Usa *${usedPrefix + command} create* para crear uno.`, m)
      }
      
      const userMatches = tinder.matches[m.sender] || []
      
      if (userMatches.length === 0) {
        return conn.reply(m.chat, '❌ Aún no tienes matches. Sigue buscando personas con *' + usedPrefix + command + ' search*', m)
      }
      
      let text = `💞 *TUS MATCHES* (${userMatches.length})\n\n`
      
      userMatches.forEach((matchId, index) => {
        const matchUser = tinder.users[matchId]
        text += `${index + 1}. ${matchUser.name} (${matchUser.age}) - ${matchUser.gender}\n`
      })
      
      text += `\nUsa *${usedPrefix}chat [número]* para iniciar una conversación con tu match.`
      
      conn.reply(m.chat, text, m)
    },
    
    // Eliminar perfil
    delete: async () => {
      if (!tinder.users[m.sender]) {
        return conn.reply(m.chat, `❌ No tienes un perfil de Tinder.`, m)
      }
      
      delete tinder.users[m.sender]
      delete tinder.likes[m.sender]
      delete tinder.matches[m.sender]
      
      // También eliminar de los likes y matches de otros usuarios
      Object.keys(tinder.likes).forEach(userId => {
        tinder.likes[userId] = tinder.likes[userId].filter(id => id !== m.sender)
      })
      
      Object.keys(tinder.matches).forEach(userId => {
        tinder.matches[userId] = tinder.matches[userId].filter(id => id !== m.sender)
      })
      
      conn.reply(m.chat, '✅ Tu perfil de Tinder ha sido eliminado correctamente.', m)
    },
    
    // Ayuda
    help: async () => {
      const text = `💝 *TINDER - AYUDA* 💝\n\n`
        + `*Comandos disponibles:*\n`
        + `• ${usedPrefix + command} create - Crear perfil de Tinder\n`
        + `• ${usedPrefix + command} edit - Editar tu perfil\n`
        + `• ${usedPrefix + command} addphoto - Añadir foto a tu perfil\n`
        + `• ${usedPrefix + command} search - Buscar personas\n`
        + `• ${usedPrefix + command} like - Dar like al último perfil visto\n`
        + `• ${usedPrefix + command} dislike - Dar dislike al último perfil visto\n`
        + `• ${usedPrefix + command} skip - Saltar el último perfil visto\n`
        + `• ${usedPrefix + command} profile - Ver tu perfil\n`
        + `• ${usedPrefix + command} matches - Ver tus matches\n`
        + `• ${usedPrefix + command} delete - Eliminar tu perfil\n`
        + `• ${usedPrefix + command} help - Mostrar esta ayuda\n\n`
        + `*Ejemplos:*\n`
        + `• ${usedPrefix + command} create María | 25 | Mujer | Música, Viajes\n`
        + `• ${usedPrefix + command} edit bio Me encanta la música y viajar\n`
        + `• ${usedPrefix + command} search`
      
      conn.reply(m.chat, text, m)
    }
  }
  
  // Determinar qué subcomando ejecutar
  const subCommand = args[0] ? args[0].toLowerCase() : 'help'
  
  if (subCommands[subCommand]) {
    await subCommands[subCommand]()
  } else {
    // Si no se reconoce el subcomando, mostrar ayuda
    await subCommands.help()
  }
}

handler.help = ['tinder']
handler.tags = ['fun']
handler.command = ['tinder']

export default handler