/*
Made by Semmel Team
Ip: semmelsmp.aternos.me
Port: 61816
*/
import {
  world,
  system,
  ItemStack,
  EnchantmentType,
  BlockTypes, EffectTypes,
  Player, ItemComponentTypes,
  EquipmentSlot,
  /*CustomCommand,
  CommandPermissionLevel,
  CustomCommandParamType,
  StartupEvent,
  CustomCommandResult,
  CustomCommandStatus,
  Entity,
  Vector3,
  CustomCommandOrigin*/
} from '@minecraft/server'
import { ActionFormData, ModalFormData, MessageFormData } from '@minecraft/server-ui'
import { ChestFormData } from './extensions/forms.js';
const RICC_KEY = 'ricc_7-nsudi_.kompetenz'
/**
 * Set a "new" Player up
 * @param {Player} player The "new" Player */
function setNew(player) {
  addScore(player, 'kills', 0)
  addScore(player, 'deaths', 0)
  addScore(player, 'h', 0)
  addScore(player, 'min', 0)
  addScore(player, 'sek', 0)
  addScore(player, 'geld', 0)
  player.setDynamicProperty('clanChat', false)
  player.setDynamicProperty('clanOwner', false)
  player.setDynamicProperty('teamInvite', 'none')
  player.setDynamicProperty('inviteMsg', 'none')
  player.setDynamicProperty('teamRequestMsg', 'none')
  player.setDynamicProperty('teamRequest', 'none')
  player.setDynamicProperty('combatMsg', false)
  player.setDynamicProperty('inCombat', '§aout of combat§r')
  player.setDynamicProperty('team', 'none')
  player.setDynamicProperty('TpPos', 'none')
  player.setDynamicProperty('chatNameColor', '§f')
  player.setDynamicProperty('chatTextColor', '§f')
}
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    //player.onScreenDisplay.setTitle({ translate: 'semmel.stats.side_bar', with: [player.name, String(score(player, "geld")), player.getDynamicProperty('team'), player.getDynamicProperty('inCombat'), String(world.getAllPlayers().length), String(new Date().getDate()), String(new Date().getMonth() + 1), String(new Date().getFullYear())] })
    player.onScreenDisplay.setTitle(sideBar(player))
    if (player.getDynamicProperty('inCombat') === '§cin combat§r') {
      if (!player.hasTag('combat')) {
        player.addTag('combat')
      }
    } else {
      if (player.hasTag('combat')) {
        player.removeTag('combat')
      }
    }
    if (player.name === 'Ricc5967') {
      if (player.getDynamicProperty(RICC_KEY) === true) {
        player.runCommand('event entity @s semmel:is_ricc')
      } else {
        player.runCommand('event entity @s semmel:isnt_ricc')
      }
    }
  }
})
const cmdPrefix = ":";
/**@type {{ name: string; description: string; syntax: string;callback: (player: Player, args: string[], event: import("@minecraft/server").ChatSendBeforeEvent;) => any;}[]} 
*/
const commands = [
  {
    name: "code",
    description: "Gib ein Code ein für ein Geschenk.", //Tom :>
    syntax: "code <code>",
    callback(player, args, event) {
      event.cancel = true
      if (args.length < 1) {
        player.sendMessage('§cDu brauchst einen Code.')
        return;
      }
      const code = parseInt(args[0])
      if (isNaN(code)) {
        player.sendMessage('[Code-system]: §cDer Code kann nur eine Zahl sein.')
        return
      }
      setScore(player, "code", Number(code))
    }
  },
  {
    name: "server",
    description: "Sende Server Ip+Port",
    syntax: "server",
    callback(player, args, event) {
      event.cancel = true
      player.sendMessage('Ip: semmelsmp.aternos.me\nport: 61816')
    }
  },
  {
    name: "dc",
    description: "Sende den Discord link.",
    syntax: "dc",
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage('§thttps://discord.gg/U4e8W2UZ88')
    }
  },
  {
    name: "transfer",
    description: "Versende Geld an andere spieler.",
    syntax: "transfer <target> <amount>",
    callback(player, args, event) {
      event.cancel = true
      if (args.length < 2) {
        player.sendMessage('[Transfer-System]: §cDu braucht einen Betrag und einen Spieler.')
        return
      }
      const targetName = args[0];
      const amount = parseInt(args[1]);
      const target = world.getPlayers().find(p => p.name.toLowerCase() === targetName.toLowerCase())
      if (!target) {
        player.sendMessage(`[Transfer-System]: §cDer Spieler ${targetName} wurde nicht gefunden.`)
        return
      }
      if (isNaN(amount) || amount <= 0) {
        player.sendMessage(`[Transfer-System]: §cBitte schreib eine positive nummer.`)
        return
      }
      if (amount > score(player, 'geld')) {
        player.sendMessage('[Transfer-System]: §cDu hast nicht genug Geld.')
        return
      }
      system.run(() => {
        moneyTransfer(player, target, amount)
      })
    }
  },
  {
    name: "shop",
    description: "Öffne den Shop.",
    syntax: "shop",
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage({ translate: "semmel.command.closeChat", with: ["Shop-System"] })
      system.run(() => {
        shop(player)
      })
    }
  },
  {
    name: 'sell',
    description: 'Öffne den Sell',
    syntax: 'sell',
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage({ translate: "semmel.command.closeChat", with: ["Sell-System"] })
      system.run(() => {
        sell(player)
      })
    }
  },
  {
    name: "spawn",
    description: "Teleprtier dich zum Spawn.",
    syntax: "spawn",
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage('§eTeleportiere in: 5sek')
      const pos = player.location
      if (player.getDynamicProperty('TpPos') === 'none') {
        player.setDynamicProperty('TpPos', { x: pos.x, y: pos.y, z: pos.z })
        countdown(player, 4, ((entity) => {
          entity.teleport(world.getDynamicProperty("spawn"), { dimension: world.getDimension('overworld') })
          entity.playSound('beacon.activate')
          entity.setDynamicProperty('TpPos', 'none')
          entity.sendMessage('§aDu wurdest Teleportiert.')
        }))
      }
    }
  },
  {
    name: "game-menu",
    description: "Öffne das Game Menu",
    syntax: "game-menu",
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage({ translate: "semmel.command.closeChat", with: ["Game-Menu"] })
      system.run(() => {
        gameMenu(player)
      })
    }
  },
  {
    name: "clan",
    description: "Aktiviere/deaktiviere Clan Chat",
    syntax: "clan chat <true/false>",
    callback(player, args, e) {
      e.cancel = true
      if (args.length < 2) return player.sendMessage('[Clan-System]: §cDu musst §etrue§c oder §efalse §ceingeben. Beispiel: §e+clan chat true')

      if (args[0] === 'chat') {
        if (Boolean(args[1])) {
          if (player.getDynamicProperty('team') === 'none') return player.sendMessage('§cDu bist in keinem Clan. Du darfst daher auch keinen Clan Chat einstellen.')
          const msg = boolean(args[1]) === true ? "§bDu hast den Clan Chat aktieviert. Nutze §e:clan chat false§b zum deaktivieren." : "§bDu hast den Clan Chat deaktiviert. Nutze §e:clan chat true§b zum aktivieren."
          player.setDynamicProperty('clanChat', boolean(args[1]))
          player.sendMessage(`[Clan-System]: ${msg}`)
          return;
        } else {
          player.sendMessage('[Clan-System]: §cDu musst eine Boolean eingeben. Das heißt §etrue §coder §efalse§c.')
        }
      }
      const msg2 = args[0] === "tom[00000]" ? "Tommy the cöck aber trotzdem falsch (easter egg)" : '§cDu musst §e+clan chat <true/false> §ceingeben.'
      player.sendMessage(`[Clan-System]: ${msg2}`)
    }
  },
  {
    name: "kopfgeld",
    description: "Setze ein Kopf Geld auf jemanden.",
    syntax: "kopfgeld <target> <amount>",
    callback(player, args, e) {
      e.cancel = true
      if (args.length < 2) {
        player.sendMessage('§cDu braucht einen Name und einen Betrag.')
        return;
      }
      const fullMessage = args.join(" ")
      const match = fullMessage.match(/^"(.*?)"\s+(\d+)\s*(.*)$|^(\S+)\s+(\d+)\s*(.*)$/);

      if (!match) {
        player.sendMessage('§cBitte nutze: §e:bounty <"Spieler Name"> <Betrag> §coder §e:bounty <SpielerName> <Betrag>');
        return;
      }

      const targetName = match[1] || match[4];
      const amount = parseInt(match[2] || match[5]);
      const target = world.getPlayers().find(p => p.name.toLowerCase() === targetName.toLowerCase())

      if (!target) return player.sendMessage(`[Bounty-System]: §cDer Spieler §e${targetName}§c wurde nicht gefunden.`)
      if (isNaN(amount) || amount <= 0) return player.sendMessage(`[Bounty-System]: §cBitte gib eine Positive Nummer ein.`)
      if (amount > score(player, 'geld')) return player.sendMessage(`[Bounty-System]: §cDu hast nicht so viel Geld. §bDu hast nur §l${score(player, 'geld')} Geld.`)

      setBounty(target, player, amount)
    }
  },
  {
    name: "msg",
    description: "Sende eine private Nachricht an einen Spieler.",
    syntax: "msg <target> <message>",
    callback(player, args, e) {
      e.cancel = true
      if (player.hasTag('mute')) {
        player.sendMessage('§cDu bist gestummt.')
        return
      }
      if (args.length < 2) {
        player.sendMessage("§cBenutzung: +msg <Spieler> <Nachricht>");
        return;
      }

      const fullMessage = args.join(" ");
      const match = fullMessage.match(/^"(.*?)"\s+(.+)$|^(\S+)\s+(.+)$/);

      if (!match) {
        player.sendMessage('§cBitte nutze: §e/msg "Spieler Name" Nachricht §coder §e/msg SpielerName Nachricht');
        return;
      }

      const targetName = match[1] || match[3];
      let message = match[2] || match[4];
      try {
        for (const [emojiSyntax, emoji] of emojiMap) {
          message = message.replaceAll(emojiSyntax, emoji)
        }
        const target = world.getPlayers().find(p => p.name.toLowerCase() === targetName.toLowerCase());
        const admins = world.getAllPlayers().find(p => p.hasTag('admin'))

        if (!target) {
          player.sendMessage(`§cSpieler §e${targetName}§c wurde nicht gefunden.`);
          return;
        }

        // Nachricht senden
        target.sendMessage(`§f[§7§oPrivat von ${player.name}§r§f] §f${message}`);
        player.sendMessage(`§f[§7§oPrivat an ${target.name}§r§f] §f${message}`);
        admins?.sendMessage(`§f[§aPrivat Nachricht von ${player.name}, an ${target.name}§f]: ${message}`)
      } catch (err) {
        player.sendMessage(`Fehler: ${err}`)
        console.info(err)
      }
    }
  },
  {
    name: "emoji-list",
    description: "Sende die Emoji Liste.",
    syntax: "emoji-list",
    callback(player, args, e) {
      e.cancel = true
      sendEmojis(player)
    }
  },
  {
    name: "tps",
    description: "Zeigt dir die Tick pro Sekunde an.",
    syntax: "tps",
    callback(player, args, e) {
      e.cancel = true
      player.sendMessage(`§bTPS: ${pullTPS().toFixed(0)}`)
    }
  },
  {
    name: 'tpa',
    description: 'Teleport Anfrage an einen anderen Spieler.',
    syntax: 'tpa <target>',
    callback(player, args, e) {
      e.cancel = false
    }
  },
  {
    name: 'tphere',
    description: 'Frage jemanden an sich zu dir zu Teleportieren.',
    syntax: 'tphere <target>',
    callback(player, args, evd) {
      evd.cancel = false
    }
  },
  {
    name: 'tpaccept',
    description: 'Nehme einkommende Tpa Anfragen an.',
    syntax: 'tpaccept',
    callback(player, args, e) {
      e.cancel = false
    }
  },
  {
    name: 'tpdecline',
    description: 'Lehne einkommende Tpa Anfragen ab.',
    syntax: 'tpdecline',
    callback(p, a, e) {
      e.cancel = false
    }
  },
  {
    name: 'tpcancel',
    description: 'Stoniere Ausgehende Tpa Anfragen.',
    syntax: 'tpcancel',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: 'tplist',
    description: 'Zeigt alle umlaufenden Tpa Anfragen an.',
    syntax: 'tplist',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: 'tphelp',
    description: 'Zeigt dir alle Tpa Commands an.',
    syntax: 'tphelp'
  },
  {
    name: 'homegui',
    description: 'Öffne das Home Menu.',
    syntax: 'homegui',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: 'sethome',
    description: 'Setze ein Home.',
    syntax: 'sethome <homeName>',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: 'home',
    description: 'Teleportiere dich zu einem Home.',
    syntax: 'home <homeName>',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: 'delhome',
    description: 'Lösche ein Home',
    syntax: 'delhome <homeName>',
    callback(p, a, e) { e.cancel = false }
  },
  {
    name: "listhomes",
    description: "Zeiht dir alle deine Homes an.",
    syntax: "listhomes",
    callback(player, args, e) {
      e.cancel = false
    }
  },
  {
    name: 'homehelp',
    description: 'Zeigt alle Home Commands an.',
    syntax: 'homehelp',
    callback(p, a, e) { e.cancel = false }
  },
  { //example command that shows the entire command list
    name: "help",
    description: "Zeige die Command Liste.",
    syntax: "help [page]",
    callback(player, args, e) {
      e.cancel = true
      const COMMANDS_PER_PAGE = world.getDynamicProperty('cmdsPerPage');
      const page = args[0] ? parseInt(args[0]) : 1
      if (isNaN(page) || page < 1) {
        player.sendMessage("§cBitte gib eine gültige Seitennummer ein.");
        return;
      }
      const totalPages = Math.ceil(commands.length / COMMANDS_PER_PAGE)
      if (page > totalPages) {
        player.sendMessage(`§cEs gibt nur ${totalPages} Seiten.`);
        return;
      }
      const startIndex = (page - 1) * COMMANDS_PER_PAGE;
      const endIndex = Math.min(startIndex + COMMANDS_PER_PAGE, commands.length);
      const pageCommands = commands.slice(startIndex, endIndex).map(cmd => `§p:${cmd.syntax} §7§l»§r §7${cmd.description}`).join("\n");
      player.sendMessage(`${colorizeText(`--------`)}§7Seite §2${page}§7/§4${totalPages}${colorizeText(`--------`)} \n${pageCommands}\n${colorizeText(`----------------------`)}`);
    }
  }
];

/**
* @param {Player} player
* @param {string} message
* @param {import("@minecraft/server").ChatSendBeforeEvent} event
*/
function parseCommand(player, message, event) {
  const args = message.toLowerCase().split(" "); //turn into a list of strings separated by spaces
  const cmdName = args.shift(); //get the first entry of args as cmd name and remove it from the list
  const command = commands.reduce((a, b) => { //gets a command object by the cmd name or undefined if not found
    return a?.name === cmdName ? a : b?.name === cmdName ? b : undefined;
  });
  //tell the player if the command does not exist
  if (!command) {
    event.cancel = true
    player.sendMessage(`§cUnbekannter Command: §e${cmdName}§c. Nutze §e${cmdPrefix}help §cfür die Command liste.`);
  }
  command?.callback(player, args, event);
} //run the command's callback function


world.beforeEvents.chatSend.subscribe((event) => {
  if (event.sender.getDynamicProperty('inCombat') === '§cin combat§r') {
    if (event.message.startsWith('-') || event.message.startsWith('!') || event.message.startsWith(cmdPrefix)) {
      event.cancel = true;
      event.sender.sendMessage({ translate: "semmel.command.inCombat" })
      return
    }
  }
  if (event.message.startsWith(cmdPrefix)) {
    parseCommand(event.sender, event.message.substring(1), event); //the substring function is used to
    //remove the prefix from the message string sent for parsing
  }
  if (event.message.startsWith("!adminCmd")) {
    if (!event.sender.hasTag('admin')) {
      event.sender.sendMessage("§cDu darfst diesen Command nicht nutzen.");
      event.cancel = true;
      return;
    }

    event.cancel = true;

    const args = event.message.trim().split(' ');
    const subCommand = args[1]?.toLowerCase();
    switch (subCommand) {
      case 'flyzone':
        if (args.length === 7) {
          const name = args[2]
          const x1 = Number(args[3])
          const z1 = Number(args[4])
          const x2 = Number(args[5])
          const z2 = Number(args[6])
          addFlyZone(event.sender, parseInt(x1), parseInt(z1), parseInt(x2), parseInt(z2), name)
        } else {
          event.sender.sendMessage("§cBitte setzte §ename, x1, z1, x2, z2 §cein.");
        }
        break;
      case 'reload':
        system.run(() => {
          event.sender.runCommand('reload')
        })
        event.sender.sendMessage('reloaded')
        break;
      case 'clearconsole':
        system.run(() => {
          console.clear()
          event.sender.sendMessage('§aConsoloe gecleart.')
        })
        break;
      case 'fill':
        const data = eFill.get(event.sender.name)
        if (!data?.from || !data?.to) return event.sender.sendMessage('Du hast nicht zwei Blöcke makiert.')
        system.run(() => {
          fill(data.from.x, data.from.y, data.from.z, data.to.x, data.to.y, data.to.z, args[2], event.sender.dimension.id)
        })
        break;
      case 'inv':
        system.run(() => {
          const targetName = args[2];
          const target = world.getPlayers().find(p => p.name.toLowerCase() === targetName.toLowerCase())
          if (!target) return event.sender.sendMessage('Der Spieler wurde nicht gefunden.')
          inventoryViewer(event.sender, target)
          event.sender.sendMessage({ translate: 'semmel.command.closeChat', with: ['Admin-Cmds'] })
        })
        break;
      default:
        event.sender.sendMessage('gibt ned :(')
        break;
    }
  }
  if (event.sender.hasTag('mute') && !event.message.startsWith('-') && !event.message.startsWith('+') && !event.message.startsWith('!tp')) {
    event.cancel = true;
    event.sender.sendMessage({ translate: 'semmel.muted' })
  }
  if (!event.message.startsWith('!') && !event.message.startsWith('-') && !event.message.startsWith(cmdPrefix) && !event.sender.hasTag('mute')) {
    const tags = event.sender.getTags()
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))
    let newMsg = event.message
    for (const [emojiSyntax, emoji] of emojiMap) { //Emoni map ist unten ganz unten :^)
      newMsg = newMsg.replaceAll(emojiSyntax, emoji)
    }
    ranks = ranks.length ? ranks : ["§7Member"]
    event.cancel = true
    if (event.sender.getDynamicProperty('team') !== 'none') {
      if (event.sender.getDynamicProperty('clanChat') === true) {
        const clanMembers = world.getAllPlayers().filter(p => p.getDynamicProperty('team') === event.sender.getDynamicProperty('team'))
        clanMembers.forEach((member) => {
          member.sendMessage(`[§aClan§r] ${event.sender.getDynamicProperty('chatNameColor')}${event.sender.name} §l§7»§r${event.sender.getDynamicProperty('chatTextColor')} ${newMsg} `)
          return;
        })
      } else {
        world.sendMessage(`§f[${ranks.join('§r§f] [')}§r§f] §l§7{§r§f${event.sender.getDynamicProperty('team')}§r§7§l} §r${event.sender.getDynamicProperty('chatNameColor')}${event.sender.name} §7§l» §r${event.sender.getDynamicProperty('chatTextColor')}${newMsg} `)
        return;
      }
    } else {
      world.sendMessage(`§f[${ranks.join('§r§f] [')}§r§f] ${event.sender.getDynamicProperty('chatNameColor')}${event.sender.name} §7§l»§r${event.sender.getDynamicProperty('chatTextColor')} ${newMsg} `)
    }
  }
})
/**
 * @param {Player} player
 * @param {import("@minecraft/server").Block} block
 */
function editCrateMenu(player, block) {
  const defalult = {
    name: '',
    desc: [],
    texture: 'textures/blocks/glass_gray',
    stackSize: 1,
    damage: 0,
    enchanted: false
  }
  const crates = world.getDynamicProperty('crates') ? JSON.parse(world.getDynamicProperty('crates')) : {}
  const value = crates[JSON.stringify(block.location)]
  let menu = value && value.menu ? value.menu : {}
  for (let i = 0; i < 26; i++) if (!menu[i]) menu[i] = { ...defalult, desc: [...defalult.desc] }
  const ui = new ModalFormData()
    .title('Loot Menu')
    .header('§eInfo:')
    .label('§bIn das Textfeld muss in der Reinfolgen: §aItem Name,Item Beschreibung,Item Texture,StackSize,Duribility,Enchanted')
  for (let i = 0; i < 26; i++) ui.textField(`Slot ${i + 1}`, "Name,beschreibung;optional,texture,stacksize,damagage,enchanted", [menu[i].name, menu[i].desc.join(';'), menu[i].texture, menu[i].stackSize, menu[i].damage, menu[i].enchanted].map(v => String(v)).join(','))

  ui.show(player).then((r) => {
    if (r.canceled) return;

    for (let i = 0; i < 26; i++) {
      const args = String(r.formValues[i]).trim().split(',')
      if (args.length < 6) return player.sendMessage('§cEs müssen überall 6 "teile" stehen.')
      const descArgs = args[1].trim().split(';')
      if (isNaN(args[3]) || isNaN(args[4]) || !Boolean(args[5])) return player.sendMessage('§cStack Size und duribility müssen eine zahl sein, enchanted eine boolean.')
      menu[i] = {
        name: args[0],
        desc: descArgs.length === 1 && descArgs[0] === '' ? [] : descArgs,
        texture: args[2],
        stackSize: Number(args[3]),
        damage: Number(args[4]),
        enchanted: boolean(args[5])
      }
    }
    world.setDynamicProperty('crates', JSON.stringify(crates))
    player.sendMessage('§bMenu wurde geupdated.')
  })
}
world.afterEvents.entityDie.subscribe((e) => {
  const entity = e.deadEntity
  const damage = e.damageSource
  if (entity.typeId === "minecraft:player") {
    const cords = entity.location
    const head = new ItemStack('minecraft:player_head', 1);
    entity.sendMessage(`§l§c»§r §cDu bist bei §e${[cords.x.toFixed(0), cords.y.toFixed(0), cords.z.toFixed(0)].join(' ')} §cgestorben.`)
    entity.setDynamicProperty('inCombat', '§aout of combat§r')
    addScore(entity, 'deaths', 1)
    if (damage.damagingEntity.typeId === 'minecraft:player') {
      let bounty = entity.getDynamicProperty('bounty')
      bounty = bounty ? JSON.parse(bounty) : undefined
      if (bounty) {
        const total = bounty['total']
        addScore(damage.damagingEntity, 'geld', total.amount)
        damage.damagingEntity.sendMessage(`[Kopfgeld]: §e${entity.name}§a hatte ein Kopfgeld von §9${total.amount}. §7[+${total.amount}]`)
        damage.damagingEntity.playSound('random.orb')
        entity.setDynamicProperty('bounty')
      }
      head.setLore([`${damage.damagingEntity.name} killt ${entity.name} `, `§c${damage.damagingEntity.name} 's kills: ${score(damage.damagingEntity, 'kills') + 1}`, `§t${entity.name}'s Tode: ${score(entity, 'deaths') + 1} `])
      damage.damagingEntity.dimension.spawnItem(head, { x: cords.x, y: cords.y, z: cords.z })
      damage.damagingEntity.sendMessage(`§c§l»§r §cDu hast §e${entity.name} gekillt `)
      addScore(entity, 'kills', 1)
    }
  }
})

world.afterEvents.playerSpawn.subscribe((e) => {
  const player = e.player
  player.setDynamicProperty('spawnTpPos', 'none')
  if (!player.hasTag('new')) {
    setNew(player)
    player.addTag('new')
    player.sendMessage(`§aWillkommen zu §lSemmelSMP§r§a, §r§f${playerName} `)
  }
  system.runTimeout(() => {
    if (player.getDynamicProperty('inCombat') === '§cin combat§r') {
      player.kill()
      player.sendMessage('§l§c»§r §cDu wurdest gekillt für Combat logging. Verlass nicht den server im Kampf.')
    }
  }, 5)
})
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
  const entity = e.target
  const player = e.player
  const item = e.itemStack
  const npcEnt = player.dimension.getEntities({ families: ['npc'] })
  if (npcEnt.includes(entity)) {
    if (player.hasTag('admin') && item?.typeId === 'minecraft:stick') {
      e.cancel = true
      system.run(() => { npcEditor(player, entity) })
      return;
    }
    if (entity.getDynamicProperty('customNPC') === true) {
      e.cancel = true
      system.run(() => {
        const npcFunc = formFunctions.find(f => f.funcName === entity.getDynamicProperty('formFunction'))
        npcFunc.func(player)
      })
    }
  }
})
/**
* @param {Player} player
* @param {import("@minecraft/server").Entity} npc
*/
function npcEditor(player, npc) {
  if (!player.hasTag('admin')) return
  const ui = new ModalFormData()
    .title('NPC Editor')
    .dropdown('Wähle eine Function aus.', formFunctions.map(f => f.funcName), 0)
    .toggle('Aktieviere Custom Mode', true)
    .show(player).then((r) => {
      if (r.canceled) return;

      const selectedFunc = formFunctions[r.formValues[0]]
      npc.setDynamicProperty('customNPC', r.formValues[1])
      npc.setDynamicProperty('formFunction', selectedFunc.funcName)
      player.sendMessage('§aNPC wurde geupdated.')
    })
}

world.afterEvents.entityHitEntity.subscribe((e) => {
  const entity = e.hitEntity
  const damage = e.damagingEntity
  const damageMainHand = damage.getComponent('equippable')?.getEquipment('Mainhand')
  if (damageMainHand?.typeId === 'minecraft:stick' && damageMainHand?.getLore().includes('§7Knockback 100')) entity.applyKnockback({ x: damage.getViewDirection().x * 150, z: damage.getViewDirection().z * 150 }, 0.5)
  if (entity.typeId === 'minecraft:player' && damage.typeId === 'minecraft:player') {
    if (entity.getDynamicProperty('inCombat') === '§aout of combat§r') {
      entity.setDynamicProperty('inCombat', '§cin combat§r')
      if (entity.getDynamicProperty('combatMsg') === true) {
        entity.sendMessage('§l§c»§r §cDu hast den Combat mode betreten. Verlasse jetzt nicht den Server oder du wirst sterben.')
      }
      system.runTimeout(() => {
        entity.setDynamicProperty('inCombat', '§aout of combat§r')
        if (entity.getDynamicProperty('combatMsg') === true) {
          entity.sendMessage('§l§c»§r §cDu hast den Combat mode verlassen.')
        }
      }, 300)
    }
    if (damage.getDynamicProperty('inCombat') === '§aout of combat§r') {
      damage.setDynamicProperty('inCombat', '§cin combat§r')
      if (damage.getDynamicProperty('combatMsg') === true) {
        damage.sendMessage('§l§c»§r §cDu hast den Combat mode betreten. Verlasse nicht den Server oder du wirst sterben.')
      }
      system.runTimeout(() => {
        damage.setDynamicProperty('inCombat', '§aout of combat§r')
        if (damage.getDynamicProperty('combatMsg') === true) {
          damage.sendMessage('§l§c»§r §cDu hast den Combat mode verlassen.')
        }
      }, 300)
    }
  }
})
const eFill = new Map()
const oreGens = ['semmel:diamond_gen', 'semmel:gold_gen', "semmel:iron_gen", 'semmel:coal_gen', 'semmel:copper_gen', 'semmel:redstone_gen']
world.beforeEvents.playerBreakBlock.subscribe((evd) => {
  const player = evd.player
  const block = evd.block
  const item = evd.itemStack
  const itemEnchant = item?.getComponent('enchantable')
  if (oreGens.includes(block.typeId)) {
    const silkTouch = new EnchantmentType('minecraft:silk_touch')
    if (itemEnchant?.hasEnchantment(silkTouch)) {
      evd.cancel = true;
      player.sendMessage({ translate: 'semmel.gens.silk_touch' })
    }
  }
  if (item.typeId === 'minecraft:wooden_axe' && player.hasTag('admin')) {
    evd.cancel = true;
    const val = eFill.get(player.name) && eFill.get(player.name).from ? { from: eFill.get(player.name).from, to: block.location } : { from: block.location, to: undefined }
    if (eFill.get(player.name)?.from && eFill.get(player.name)?.to) { system.run(() => { return player.playSound('note.bass') }); return; }

    eFill.set(player.name, val)
    system.run(() => {
      player.playSound('note.pling')
    })
  }
})

world.afterEvents.playerBreakBlock.subscribe((e) => {
  const block = e.block
  const dim = e.dimension
  const oldBlock = e.brokenBlockPermutation
  if (oreGens.includes(oldBlock.type.id)) {
    dim.setBlockType({ x: block.location.x, y: block.location.y, z: block.location.z }, oldBlock.type.id)
  }
})

world.afterEvents.playerPlaceBlock.subscribe((evd) => {
  const player = evd.player;
  const block = evd.block;
  if (oreGens.includes(block.typeId)) {
    player.onScreenDisplay.setActionBar({ translate: 'semmel.gens.place' })
  }
})

world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
  const block = e.block
  const player = e.player;
  const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
  if (block.typeId.includes('shulker')) {
    if (mainHand?.typeId === 'minecraft:stick' && player.hasTag('admin')) {
      system.run(() => {
        if (e.isFirstEvent) if (player.isSneaking) setCrate(player, block)

        if (e.isFirstEvent) if (!player.isSneaking) editCrateMenu(player, block)
      });
      e.cancel = true
      return;

    }
    if (!JSON.parse(world.getDynamicProperty('crates'))[JSON.stringify(block.location)]) return;

    e.cancel = true
    system.run(() => {
      if (e.isFirstEvent) {
        try {
          if (world.getDynamicProperty('crates')) {
            let crates = world.getDynamicProperty(`crates`)
            crates = crates ? JSON.parse(crates) : {}
            const values = crates[JSON.stringify(block.location)] ? crates[JSON.stringify(block.location)] : {
              crateCommands: ['give @s diamond'],
              item: 'minecraft:diamond',
              menu: {}
            }
            const chest = values?.menu
            if (!chest) return player.sendMessage('§cDer Crate hat Kaputte Data. Bitte zeig das einem Admin.')

            const ui = new ChestFormData()
              .title('Loot')
            for (const button in chest) {
              const slot = chest[Number(button)]
              ui.button(Number(button), slot.name, slot.desc, slot.texture, slot.stackSize, slot.durability, slot.enchanted)
            }
            ui.button(26, 'Öffnen', ['§7Klicke um den Crate zu Öffnen.'], 'minecraft:paper', 1, 0, true)
              .show(player).then((r) => {
                if (r.canceled) return;

                if (r.selection === 26) activateCrate(player, block)
              })
          }
        } catch (error) {
          player.sendMessage('§cEs gibt ein Error bitte zeig dies einem Admin: ' + error)
          console.error(error)
        }
      }
    })
  }
  if (oreGens.includes(block.typeId)) {
    if (player.isSneaking && mainHand) return;

    system.run(() => {
      if (e.isFirstEvent) {
        genRemover(player, block, block.typeId)
      }
    })
  }
});
function activateCrate(player, block) {
  if (world.getDynamicProperty('crates')) {
    let crates = world.getDynamicProperty(`crates`)
    crates = crates ? JSON.parse(crates) : {}
    const values = crates[JSON.stringify(block.location)] ? crates[JSON.stringify(block.location)] : {
      crateCommands: ['give @s diamond'],
      item: 'minecraft:diamond',
      menu: {}
    }
    if (!hasEnoughItems(player, values.item, 1)) return player.sendMessage(`§cDu hast kein ${values.item}.`);

    player.runCommand(`clear @s ${values.item} 0 1`)
    const randomIndex = Math.floor(Math.random() * values.crateCommands.length)
    player.runCommand(String(values.crateCommands[randomIndex]))
  }
}
/**Bearbeite eine Shulker box
 * @param {Player} player
 * @param {import('@minecraft/server').Block} block
 */
function setCrate(player, block) {
  let crates = world.getDynamicProperty('crates')
  crates = crates ? JSON.parse(crates) : {}
  const values = crates && crates[JSON.stringify(block.location)] ? crates[JSON.stringify(block.location)] : {
    crateCommands: [],
    item: '',
    menu: {},
  }
  const ui = new ModalFormData()
    .title('Crate')
    .textField('Schreibe die möglichen Commands rein. Nutze ; Um eine Neue möglichkeit. (OHNE §e/ §r)', "give @s diamond;say hi", values.crateCommands.join(';'))
    .textField('Welches item ist benötige (Indentfire)', 'minecraft:diamond', values.item)
    .toggle('Aktiviere Crate Mode', true)
    .show(player).then((r) => {
      if (r.canceled) return;

      if (r.formValues[2] === false) {
        system.run(() => {
          delete crates[JSON.stringify(block.location)]
          player.sendMessage('Block wurde geuncrated')
          world.setDynamicProperty('crates', JSON.stringify(crates))
        })
        return;
      }
      if (!r.formValues[0] || !r.formValues[1]) return player.sendMessage('§cDa muss was stehen.')
      const chest = crates[JSON.stringify(block.location)] && crates[JSON.stringify(block.location)].menu ? crates[JSON.stringify(block.location)].menu : {}
      const Commands = r.formValues[0].trim().split(';')
      crates[JSON.stringify(block.location)] = {
        crateCommands: Commands,
        item: r.formValues[1],
        menu: chest
      }
      world.setDynamicProperty('crates', JSON.stringify(crates))
      player.sendMessage('§aBlock wurde geupdated.')
    })
}
function genRemover(player, block, blockType) {
  const ui = new MessageFormData()
    .title('Entferne Gen')
    .body({ translate: 'semmel.gens.menu' })
    .button1({ translate: 'semmel.button.back' })
    .button2({ translate: 'semmel.button.remove' });
  ui.show(player).then((r) => {
    if (r.canceled) return;
    if (r.selection === 0) {
      return;
    } else if (r.selection === 1) {
      block.dimension.setBlockType({ x: block.location.x, y: block.location.y, z: block.location.z }, 'minecraft:air');
      const itemBlock = new ItemStack(blockType, 1)
      block.dimension.spawnItem(itemBlock, { x: block.location.x + 0.50, y: block.location.y + 0.50, z: block.location.z + 0.50 });
      player.sendMessage(`§aDer Block wurde abgebaut.`);
      player.playSound('note.pling');
    }
  })
}


function coinsTransfer(player) {
  const allPlayers = world.getAllPlayers().filter(p => p.name !== player.name)
  if (allPlayers.length <= 0) return player.sendMessage('[Tarnsfer-System]: §eDu bist alleine. Du kannst keinem anderen Spieler Geld versenden.')
  const ui = new ModalFormData()
    .title("§gCoin Transfer")
    .dropdown('Suche ein Spieler aus.', allPlayers.map(p => p.name))
    .textField('Wie viel möchtest du versenden?', '100')
    .show(player).then((r) => {
      if (r.canceled) {
        return;
      }
      const target = allPlayers[r.formValues[0]]
      const amount = parseInt(r.formValues[1]);

      if (!target) {
        player.sendMessage(`[Transfer-System]: §cDer Spieler ${targetName} wurde nicht gefunden.`);
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        player.sendMessage(`[Transfer-System]: §cBitte schreibe eine positive nummer.`);
        return;
      }
      if (score(player, "geld") < amount) {
        player.sendMessage(`[Transfer-System]: §cDu hast nicht ${amount} Geld, du hast nur ${score(player, "geld")} Geld.`);
        return;
      }
      moneyTransfer(player, target, amount);
    });
}
function shop(player) {
  const ui = new ChestFormData('single')
    .title('Shop')
    .button(26, 'Wechsel zum Sell', ['§7Öffne den Sell.'], 'minecraft:book')
    .pattern([
      'ggggggggg',
      'gabps___g',
      'gggggggg_',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
      a: { itemName: 'End Zeug', texture: 'minecraft:ender_eye', itemDesc: ['§7Klick zum anschauen.'] },
      b: { itemName: 'Bau', itemDesc: ['§7Klicke zum anschauen'], texture: 'minecraft:brick_block' },
      p: { itemName: 'PvP Shop', itemDesc: ['§7Klicke zum anschauen'], texture: 'minecraft:diamond_sword' },
      s: { itemName: 'Ore Gens', itemDesc: ['§7Klicke zum anschauen'], texture: 'minecraft:diamond_ore', enchanted: true },
    })
  ui.show(player).then((r) => {
    if (r.cancelationReason === "UserBusy") {
      return system.runTimeout(() => shop(player), 10);
    }
    if (r.canceled) return

    switch (r.selection) {
      case 10:
        endShop(player)
        break;
      case 11:
        bauShop(player)
        break;
      case 12:
        pvpShop(player)
        break;
      case 13:
        oreGenShop(player)
        break;
      case 26:
        sell(player)
        break;
      default:
        shop(player)
        break;
    }
  })
}
/** Pickaxe Level Preis
 * level 1: 10000💀
 * level 3: 7500000💀
 */
function oreGenShop(player) {
  system.run(() => {
    const ui = new ChestFormData('18')
      .title('Ore Gens')
      .button(0, 'Diamant Gen', [`§aPreis: ${world.getDynamicProperty('diamond.gen_price')}`, '§7Klick um weiter zu gehen'], 'minecraft:diamond_ore')
      .button(1, 'Gold Gen', [`§aPreis: ${world.getDynamicProperty('gold.gen_price')}`, '§7Klicke um weiter zu gehen.'], 'minecraft:gold_ore')
      .button(13, 'Erz Spitzhacken', ['§eLevel 2', `150000`], 'textures/items/ore_picke')
      .button(9, '§cZurück', ['§7Gehe eine Seite zurück.'], "minecraft:barrier")
      .pattern([
        '_________',
        '_gg___ggg'
      ], {
        g: { texture: 'textures/blocks/glass_gray' },
      })
    ui.show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          newShop(player, 'Diamant Gen', 'semmel:diamond_gen', 'minecraft:diamond_ore', world.getDynamicProperty('diamond.gen_price'), true, (() => { return oreGenShop(player) }))
          break;
        case 1:
          newShop(player, 'Gold Gen', 'semmel:gold_gen', 'minecraft:gold_ore', world.getDynamicProperty('gold.gen_price'), true, (() => { oreGenShop(player) }))
          break;
        case 13:
          shopHelp(player, 150000, 1, 'semmel:ore_pickaxe', oreGenShop)
          break;
      }
    })
  })
}

function pvpShop(player) {
  const ui = new ChestFormData('9')
    .title('PvP Shop')
    .button(0, 'Obsidian', ['§aPreis: 100', '§7Klicke um weiter zu gehen.'], 'minecraft:obsidian')
    .button(1, 'Ender Kristall', ['§aPreis: 250', '§7Klicke um weiter zu gehen.'], 'minecraft:end_crystal')
    .button(2, 'Seelen Anker', ['§aPreis: 250', '§7Klicke um weiter zu gehen '], 'minecraft:respawn_anchor_charge_4')
    .button(3, 'Glow Stone', ['§aPreis: 200', '§7Klicke um weiter zu gehen.'], 'minecraft:glowstone')
    .button(4, '§eTotem', ['§aPreis: 200', '§7Klicke zum Kaufen.'], 'minecraft:totem_of_undying')
    .button(5, '§9Wasser§r/§6Lava', ['§aPreis: 700', '§7Klicke um weiter zu gehen.'], 'minecraft:bucket')
    .button(6, 'xp Flaschen', ['§aPreis: 700', '§7Klicke um weiter zu gehen.'], 'minecraft:experience_bottle', 1, 0, true)
    .button(7, 'Wind Kugel', ['§aPreis: 1000', '§7Klicke um weiter zu gehen.'], 'minecraft:wind_charge')
    .button(8, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          obsidianShop(player)
          break;
        case 1:
          crystalShop(player)
          break;
        case 2:
          respawnAnchorShop(player)
          break;
        case 3:
          glowStoneShop(player)
          break;
        case 4:
          shopHelp(player, 200, 1, 'minecraft:totem_of_undying', pvpShop)
          break;
        case 5:
          wasserLavaShop(player)
          break;
        case 6:
          xpShop(player)
          break;
        case 7:
          windChargeShop(player)
          break;
        case 8:
          shop(player)
          break;
      }
    })
}
function windChargeShop(player) {
  const preis = 1000
  const ui = new ChestFormData('single')
    .title(`Wind Kugel Shop`)
    .button(4, 'Wind Kugel', ['§8Das aktuelle Item.'], 'minecraft:ominous_trial_key')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Wind Kugel.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Wind Kugeln.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Wind Kugeln.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Wind Kugeln.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Wind Kugeln.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:ominous_trial_key', windChargeShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:ominous_trial_key', windChargeShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:ominous_trial_key', windChargeShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:ominous_trial_key', windChargeShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:ominous_trial_key', windChargeShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        windChargeShop(player)
        break;
    }
  })
}
function xpShop(player) {
  const preis = 700
  const ui = new ChestFormData('single')
    .title(`xp Shop`)
    .button(4, 'xp Flasche', ['§8Das aktuelle Item.'], 'minecraft:experience_bottle')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x xp Flasche.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x xp Flaschen.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x xp Flaschen.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x xp Flaschen.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x xp Flaschen.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:experience_bottle', xpShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:experience_bottle', xpShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:experience_bottle', xpShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:experience_bottle', xpShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:experience_bottle', xpShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        xpShop(player)
        break;
    }
  })
}
function wasserLavaShop(player) {
  const preis = 700
  const ui = new ChestFormData('9')
    .title('Lava/Wasser Shop')
    .button(1, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(3, 'Wasser', ['§aPreis (1x): 700', '§7Klicke um zu kaufen.'], 'minecraft:water_bucket')
    .button(5, '§9Wasser§r/§6Lava', ['§8Das aktuelle Item.'], 'minecraft:bucket')
    .button(7, 'Lava', [`Preis(1x): ${preis} `, '§7Klicke um zu kaufen.'], 'minecraft:lava_bucket')
    .button(8, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'g_g_g_g__',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 3:
        shopHelp(player, preis, 1, 'minecraft:water_bucket', wasserLavaShop)
        break;
      case 7:
        shopHelp(player, preis, 1, 'minecraft:lava_bucket', wasserLavaShop)
        break;
      case 8:
        pvpShop(player)
        break;
      default:
        wasserLavaShop(player)
        break;
    }
  })
}
function glowStoneShop(player) {
  const preis = 200
  const ui = new ChestFormData('single')
    .title(`Glow Stone`)
    .button(4, 'Glow Stone', ['§8Das aktuelle Item.'], 'minecraft:glowstone')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Glow Stone.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Glow Stone.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Glow stone.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Glow Stone.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Glow Stone.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:glowstone', glowStoneShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:glowstone', glowStoneShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:glowstone', glowStoneShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:glowstone', glowStoneShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:glowstone', glowStoneShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        glowStoneShop(player)
        break;
    }
  })
}
function respawnAnchorShop(player) {
  const preis = 250
  const ui = new ChestFormData('single')
    .title('Seelen Anker Shop')
    .button(4, 'Seelen Anker', ['§8Das aktuelle Item.'], 'minecraft:respawn_anchor_charge_4')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Seelen Anker.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Seelen Anker.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Seelen Anker.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Seelen Anker.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Seelen Anker.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:respawn_anchor', respawnAnchorShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:respawn_anchor', respawnAnchorShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:respawn_anchor', respawnAnchorShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:respawn_anchor', respawnAnchorShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:respawn_anchor', respawnAnchorShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        respawnAnchorShop(player)
        break;
    }
  })
}
function crystalShop(player) {
  const preis = 250
  const ui = new ChestFormData('single')
    .title('Ender Kristall Shop')
    .button(4, 'Ender Kristall', ['§8Das aktuelle Item.'], 'minecraft:end_crystal', 1, 0, true)
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Ender Kristalle.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Ender Kristalle.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Ender Kristalle.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Ender Kristalle.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Ender Kristalle.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:end_crystal', crystalShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:end_crystal', crystalShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:end_crystal', crystalShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:end_crystal', crystalShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:end_crystal', crystalShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        crystalShop(player)
        break;
    }
  })
}
function obsidianShop(player) {
  const preis = 100
  const ui = new ChestFormData('single')
    .title('Obsidian Shop')
    .button(4, 'Obsidian', ['§8Das aktuelle Item.'], 'minecraft:obsidian')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Obsidian.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Obsidian.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Obsidian.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Obsidian.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Obsidian.'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:obsidian', obsidianShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:obsidian', obsidianShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:obsidian', obsidianShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:obsidian', obsidianShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:obsidian', obsidianShop)
        break;
      case 18:
        pvpShop(player)
        break;
      default:
        obsidianShop(player)
        break;
    }
  })
}
function bauShop(player) {
  const ui = new ChestFormData('9')
    .title('Bau')
    .button(0, 'Ziegel', ['§aPreis: 10', '§7Klicke zum weiter zu gehen.'], 'minecraft:brick_block')
    .button(1, 'Keramik', ['§aPreis: 15', '§7Klicke für jede Farbe.'], 'minecraft:white_terracotta')
    .button(2, 'Bruch Stein', ['§aPreis: 5', '§7Klicke um weiter zu gehen.'], 'minecraft:cobblestone')
    .button(3, 'Tiefen Schiefer Fliesen', ["§aPreis: 15", '§7Klicke um weiter zu gehen.'], 'minecraft:deepslate_tiles')
    .button(4, 'Stein Ziegel', ['§aPreis: 5', '§7Klicke um weiter zu gehen.'], 'minecraft:stone_bricks')
    .button(5, 'Teppich', ['§aPreis: 10', '§7Klicke für alle Farben.'], 'minecraft:white_carpet')
    .button(6, 'Beton', ['§aPreis: 15', '§7Klicke für alle Farben.'], 'minecraft:white_concrete')
    .button(8, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .button(7, '', [], 'textures/blocks/glass_gray')
  ui.show(player).then((r) => {
    if (r.canceled) return;
    switch (r.selection) {
      case 0:
        brickShop(player)
        break;
      case 1:
        colorShopSell(player, 'Keramik', 'terracotta', 'white_terracotta', 'terracotta', 15, true, (() => { return bauShop(player) }))
        break;
      case 2:
        newShop(player, 'Bruchstein', 'minecraft:cobblestone', 'minecraft:cobblestone', 5, true, (() => { return bauShop(player) }))
        break;
      case 3:
        newShop(player, 'Tiefenschiefer', 'minecraft:deepslate_tiles', 'minecraft:deepslate_tiles', 15, true, (() => { return bauShop(player) }))
        break;
      case 4:
        newShop(player, 'Stein Ziegel', 'minecraft:stone_bricks', 'minecraft:stone_bricks', 5, true, (() => { return bauShop(player) }))
        break;
      case 5:
        colorShopSell(player, 'Teppich', 'carpet', 'white_carpet', 'carpet', 10, true, bauShop)
        break;
      case 6:
        colorShopSell(player, 'Beton', 'white_concrete', 'white_concrete', 'white_concrete', 15, true, bauShop)
        break;
      case 8:
        shop(player)
        break;
      default:
        bauShop(player)
        break;
    }
  })
}
function colorShopSell(player, itemName, itemTexture, defaultTexture, itemIndentfire, preis, isShop, previousPage) {
  const ui = new ChestFormData('36')
    .title(`${itemName} Shop`)
    .button(10, `Weißes ${itemName} `, [`Kaufe weißen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: ${defaultTexture} `)
    .button(11, `Schwarzes ${itemName} `, [`Kaufe schwarzen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: black_${itemTexture} `)
    .button(12, `Rotes ${itemName} `, [`Kaufe roten ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: red_${itemTexture} `)
    .button(13, `Braunes ${itemName} `, [`Kaufe braunen ${itemName}.`, '§7Klicke um weiter zu gehen'], `minecraft: brown_${itemTexture} `)
    .button(14, `Blaues ${itemName} `, [`Kaufe blauen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: blue_${itemTexture} `)
    .button(15, `Grünes ${itemName} `, [`Kaufe grünen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: green_${itemTexture} `)
    .button(16, `Lila ${itemName} `, [`Kaufe Lila ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: purple_${itemTexture} `)
    .button(19, `Türkises ${itemName} `, [`Kaufe Türkisen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: cyan_${itemTexture} `)
    .button(20, `Hellgraues ${itemName} `, [`Kaufe hellgrauen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: light_gray_${itemTexture} `)
    .button(21, `Graues ${itemName} `, [`Kuafe graues ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: gray_${itemTexture} `)
    .button(22, `Pinkes ${itemName} `, [`Kaufe pinken ${itemName}.`, 'Klicke um weiter zu gehen.'], `minecraft: pink_${itemTexture} `)
    .button(23, `Hellgrünes ${itemName} `, [`Kaufe hellgrünen ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: lime_${itemTexture} `)
    .button(24, `Gelbes ${itemName} `, [`Kaufe gelben ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: yellow_${itemTexture} `)
    .button(25, `Hellblaues ${itemName} `, [`Kaufe hellblaues ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: light_blue_${itemTexture} `)
    .button(26, `Magenta ${itemName} `, [`Kaufe magenta ${itemName}.`, '§7Klicke um weiter zu gehen.'], `minecraft: magenta_${itemTexture} `)
    .button(27, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'ggggggggg',
      'g_______g',
      'g_______g',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    });

  ui.show(player).then((r) => {
    if (r.canceled) return;

    const type = isShop ? newShop : newSell;
    const next = (() => { return colorShopSell(player, itemName, itemTexture, defaultTexture, itemIndentfire, preis, isShop, previousPage) });

    const colorMap = {
      10: 'white',
      11: 'black',
      12: 'red',
      13: 'brown',
      14: 'blue',
      15: 'green',
      16: 'purple',
      19: 'cyan',
      20: 'light_gray',
      21: 'gray',
      22: 'pink',
      23: 'lime',
      24: 'yellow',
      25: 'light_blue',
      26: 'magenta'
    }
    const color = colorMap[r.selection];
    if (color) {
      const id = r.selection === 10 ? `minecraft: ${defaultTexture} ` : `minecraft: ${color}_${itemIndentfire} `;
      const tex = r.selection === 10 ? `minecraft: ${defaultTexture} ` : `minecraft: ${color}_${itemTexture} `;
      type(player, itemName, id, tex, preis, true, next);
    } else if (r.selection === 27) {
      if (typeof previousPage === 'function') previousPage(player);
      else player.sendMessage('§cFehler: Keine vorherige Seite verfügbar.');
    } else {
      next();
    }

  });
}
function brickShop(player) {
  const preis = 10
  const ui = new ChestFormData('single')
    .title(`Ziegel`)
    .button(4, 'Ziegel', ['§8Das aktuelle Item.'], 'minecraft:brick_block')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x Ziegel.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x Ziegel'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x Ziegel'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x Ziegel'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x Ziegel'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:brick_block', brickShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:brick_block', brickShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:brick_block', brickShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:brick_block', brickShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:brick_block', brickShop)
        break;
      case 18:
        bauShop(player)
        break;
      default:
        brickShop(player)
        break;
    }
  })
}
function endShop(player) {
  const ui = new ChestFormData('9')
    .title('End Zeug')
    .button(8, '§cZurück', ['§7Geh eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'gegsgpgc_',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
      e: { texture: 'minecraft:elytra', itemName: '§5Elytra', itemDesc: ['§aPreis: 15000', '§7Klicke zu kaufen.'] },
      s: { texture: 'minecraft:end_rod', itemName: 'End Stab', itemDesc: ['§aPreis: 2000', '§7Klicke um weiter zu gehen.'] },
      p: { texture: 'minecraft:ender_pearl', itemName: 'Ender Perle', itemDesc: ['§aPreis: 750', '§7Klicke um weiter zu gehen.'] },
      c: { texture: 'minecraft:ender_chest', itemName: 'Ender Chest', itemDesc: ['§aPreis: 1500', '§7Klicke um weiter zu gehen.'] }
    })
  ui.show(player).then((r) => {
    if (r.canceled) return
    switch (r.selection) {
      case 1:
        shopHelp(player, 15000, 1, 'minecraft:elytra', endShop)
        break;
      case 3:
        endRodShop(player)
        break;
      case 5:
        enderPearlShop(player)
        break;
      case 7:
        enderChestShop(player)
        break;
      case 8:
        shop(player)
        break;
      default:
        endShop(player)
        break;
    }
  })
}
function endRodShop(player) {
  const preis = 2000
  const ui = new ChestFormData('single')
    .title(`End Stab Shop`)
    .button(4, 'End Stab', ['§8Das aktuelle Item.'], "minecraft:end_rod")
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', ['§aPreis für 1x: 2000', '§7Kaufe 1x End Stab.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', ['§aPreis für 16x: 32000', '§7Kaufe 16x End Stäbe.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', ['§aPreis für 32x: 64000', '§7Kaufe 32x End Stäbe.'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', ['§aPreis für 48x: 96000', '§7Kaufe 48x End Stäbe.'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', ['§aPreis für 64x: 128000', "§7Kaufe 64x End Stäbe."], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, preis, 1, 'minecraft:end_rod', endRodShop)
        break;
      case 12:
        shopHelp(player, preis * 16, 16, 'minecraft:end_rod', endRodShop)
        break;
      case 13:
        shopHelp(player, preis * 32, 32, 'minecraft:end_rod', endRodShop)
        break;
      case 14:
        shopHelp(player, preis * 48, 48, 'minecraft:end_rod', endRodShop)
        break;
      case 15:
        shopHelp(player, preis * 64, 64, 'minecraft:end_rod', endRodShop)
        break;
      case 18:
        endShop(player);
        break;
      default:
        endRodShop(player)
        break;
    }
  })
}
function enderPearlShop(player) {
  const ui = new ChestFormData('single')
    .title(`Ender Pearls`)
    .button(4, 'Ender Perle', ['§8Das aktuelle Item.'], 'minecraft:ender_pearl')
    .button(8, '§aDein Geld', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', ['§aPreis für 1x: 750', '§7Kaufe 1x Ender Perle.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(13, '8x Kaufen', ['§aPreis für 8x: 6000', '§7Kaufe 8x Ender Perlen.'], 'minecraft:orange_stained_glass_pane', 8)
    .button(15, '16x Kaufen', ['§aPreis für 16x: 12000', '§7Kaufe 16x Ender perlen.'], 'minecraft:orange_stained_glass_pane', 16)
    .button(18, '§cZurück', ['§7Geh eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_g_g_gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 11:
          shopHelp(player, 750, 1, 'minecraft:ender_pearl', enderPearlShop)
          break;
        case 13:
          shopHelp(player, 6000, 8, 'minecraft:ender_pearl', enderPearlShop)
          break;
        case 15:
          shopHelp(player, 12000, 16, 'minecraft:ender_pearl', enderPearlShop)
          break;
        case 18:
          endShop(player);
          break;
        default:
          enderPearlShop(player);
          break;
      }
    })
}
function enderChestShop(player) {
  const ui = new ChestFormData('single')
    .title(`Ender Chest`)
    .button(4, 'Ender Chest', ['§8Das aktuelle Item.'], 'minecraft:ender_chest')
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingor', 1, 0, true)
    .button(11, '1x Kaufen', ['§aPreis für 1x: 1500', '§7Kaufe 1x Ender Chest'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', ['§aPreis für 16x: 24000', "§7Kaufe 16x Ender Chest's"], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', ['§aPreis für 32x: 48000', "§7Kaufe 32x Ender Chest's"], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', ['§aPreis für 48x: 72000', "§7Kaufe 48x Ender Chest's"], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', ['§aPreis für 64x: 96000', "§7Kaufe 64x Ender Chest's"], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück.'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 11:
        shopHelp(player, 1500, 1, 'minecraft:ender_chest', enderChestShop)
        break;
      case 12:
        shopHelp(player, 24000, 16, 'minecraft:ender_chest', enderChestShop)
        break;
      case 13:
        shopHelp(player, 48000, 32, 'minecraft:ender_chest', enderChestShop)
        break;
      case 14:
        shopHelp(player, 72000, 48, 'minecraft:ender_chest', enderChestShop)
        break;
      case 15:
        shopHelp(player, 96000, 64, 'minecraft:ender_chest', enderChestShop)
        break;
      case 18:
        endShop(player)
        break;
      default:
        enderChestShop(player)
        break;
    }
  })
}
function shopHelp(player, moneyAmount, itemAmount, itemStack, func) {
  const inv = player.getComponent('inventory').container
  if (score(player, 'geld') < moneyAmount) {
    player.sendMessage('[Shop-System]: §cDu hast nicht genug Geld.')
    player.playSound('note.bass')
    return;
  } else {
    removeScore(player, 'geld', moneyAmount)
    const item = new ItemStack(itemStack, itemAmount)
    inv.addItem(item)
    player.sendMessage('[Shop-System]: §aKauf erfolgreich.')
    player.playSound('random.orb')
    func(player)
  }
}
/**@param {Player} player
 * @param {String} item
 * @param {String} itemIndentfire
 * @param {String} itemTexture
 * @param {Number} preis
 * @param {Booloean} isMaxStackSize
 * @param {function} previousPage
 */
function newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage) {
  const shopSize = isMaxStackSize ? (new ChestFormData('single')
    .title(item)
    .button(4, item, ['§8Das aktuelle Item.'], itemTexture)
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, `§7Kaufe 16x`], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Kaufen', [`§aPreis für 32x: ${preis * 32} `, '§7Kaufe 32x'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Kaufen', [`§aPreis für 48x: ${preis * 48} `, '§7Kaufe 48x'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Kaufen', [`§aPreis für 64x: ${preis * 64} `, '§7Kaufe 64x'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 11:
          shopHelp(player, preis, 1, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 12:
          shopHelp(player, preis * 16, 16, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 13:
          shopHelp(player, preis * 32, 32, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 14:
          shopHelp(player, preis * 48, 48, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 15:
          shopHelp(player, preis * 64, 64, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 18:
          previousPage()
          break;
        default:
          newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage)
          break;
      }
    })
  ) : (
    new ChestFormData('single')
      .title(item)
      .button(4, item, ['§8Das aktuelle Item.'], itemTexture)
      .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
      .button(11, '1x Kaufen', [`§aPreis für 1x: ${preis} `, '§7Kaufe 1x.'], 'minecraft:orange_stained_glass_pane', 1)
      .button(13, '8x Kaufen', [`§aPreis für 8x: ${preis * 8} `, '§7Kaufe 8x'], 'minecraft:orange_stained_glass_pane', 8)
      .button(15, '16x Kaufen', [`§aPreis für 16x: ${preis * 16} `, '§7Kaufe 16x'], 'minecraft:orange_stained_glass_pane', 16)
      .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
      .pattern([
        'gggg_ggg_',
        'gg_g_g_gg',
        '_gggggggg',
      ], {
        g: { texture: 'textures/blocks/glass_gray' }
      })
      .show(player).then((r) => {
        if (r.canceled) return;

        switch (r.selection) {
          case 11:
            shopHelp(player, preis, 1, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 13:
            shopHelp(player, preis * 8, 8, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 15:
            shopHelp(player, preis * 16, 16, itemIndentfire, newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 18:
            previousPage(player)
            break;
          default:
            newShop(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage)
            break;
        }
      })
  );
  return shopSize
}
function newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage) {
  const sellSize = isMaxStackSize ? (new ChestFormData('single')
    .title(item)
    .button(4, item, ['§8Das aktuelle Item.'], itemTexture)
    .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
    .button(11, '1x Verkaufe', [`§aVerkaufspreis für 1x: ${preis} `, '§7Verkaufe 1x.'], 'minecraft:orange_stained_glass_pane', 1)
    .button(12, '16x Verkaufen', [`§aVerkaufspreis für 16x: ${preis * 16} `, `§7Verkaufe 16x`], 'minecraft:orange_stained_glass_pane', 16)
    .button(13, '32x Verkaufen', [`§aVerkaufspreis für 32x: ${preis * 32} `, '§7Verkaufe 32x'], 'minecraft:orange_stained_glass_pane', 32)
    .button(14, '48x Verkaufen', [`§aVerkaufspreis für 48x: ${preis * 48} `, '§7Verkaufe 48x'], 'minecraft:orange_stained_glass_pane', 48)
    .button(15, '64x Verkaufen', [`§aVerkaufspreis für 64x: ${preis * 64} `, '§7Verkaufe 64x'], 'minecraft:orange_stained_glass_pane', 64)
    .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      'gggg_ggg_',
      'gg_____gg',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' }
    })
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 11:
          sellHelp(player, preis, 1, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 12:
          sellHelp(player, preis * 16, 16, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 13:
          sellHelp(player, preis * 32, 32, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 14:
          sellHelp(player, preis * 48, 48, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 15:
          sellHelp(player, preis * 64, 64, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
          break;
        case 18:
          previousPage(player)
          break;
        default:
          newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage)
          break;
      }
    })
  ) : (
    new ChestFormData('single')
      .title(item)
      .button(4, item, ['§8Das aktuelle Item.'], itemTexture)
      .button(8, '§aDein Geld:', [score(player, 'geld')], 'minecraft:gold_ingot', 1, 0, true)
      .button(11, '1x Verkaufen', [`§aVerkaufspreis für 1x: ${preis} `, '§7Verkaufe 1x.'], 'minecraft:orange_stained_glass_pane', 1)
      .button(13, '8x Verkaufen', [`§aVerkaufspreis für 8x: ${preis * 8} `, '§7Verkaufe 8x'], 'minecraft:orange_stained_glass_pane', 8)
      .button(15, '16x Verkaufen', [`§aVerkaufspreis für 16x: ${preis * 16} `, '§7Verkaufe 16x'], 'minecraft:orange_stained_glass_pane', 16)
      .button(18, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
      .pattern([
        'gggg_ggg_',
        'gg_g_g_gg',
        '_gggggggg',
      ], {
        g: { texture: 'textures/blocks/glass_gray' }
      })
      .show(player).then((r) => {
        if (r.canceled) return;

        switch (r.selection) {
          case 11:
            sellHelp(player, preis, 1, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 13:
            sellHelp(player, preis * 8, 8, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 15:
            sellHelp(player, preis * 16, 16, itemIndentfire, newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage))
            break;
          case 18:
            previousPage()
            break;
          default:
            newSell(player, item, itemIndentfire, itemTexture, preis, isMaxStackSize, previousPage)
            break;
        }
      })
  );
  return sellSize
}


/**
* @param {Player} player
* @param {number} moneyAmount
* @param {number} minItemAmount
* @param {string} itemStack
* @param {function} func
*/
function sellHelp(player, moneyAmount, minItemAmount, itemStack, func) {
  if (hasEnoughItems(player, itemStack, minItemAmount)) {
    system.run(() => {
      player.runCommand(`clear @s ${itemStack} 0 ${minItemAmount} `)
      player.sendMessage(`[Sell-System]: §aDu hast ${minItemAmount} Items Verkauft.`)
      addScore(player, 'geld', moneyAmount)
      player.playSound('random.orb')
      func(player)
    })
  } else {
    player.sendMessage('[Shop-System]: §cDu hast nicht genug Items.')
    player.playSound('note.bass')
  }
}

function sell(player) {
  const ui = new ChestFormData('single')
    .title('Sell')
    .button(10, 'Erze', ['§7Klicke zum anschauen.'], 'minecraft:diamond_ore')
    .button(26, 'Wechsle zum Shop', ['§7Öffne den Shop'], 'minecraft:book')
    .pattern([
      'ggggggggg',
      'g__aaaaag',
      'gggggggg_',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
      a: { texture: 'minecraft:air' }
    })
  ui.show(player).then((r) => {
    if (r.cancelationReason === "UserBusy") {
      return system.runTimeout(() => sell(player), 10);
    }
    if (r.canceled) return;

    switch (r.selection) {
      case 10:
        oreSell(player)
        break;
      case 26:
        shop(player)
        break;
      default:
        sell(player)
        break;
    }
  })
}
function oreSell(player) {
  const ui = new ChestFormData('18')
    .title('Erze Items')
    .button(0, 'Diamant', [`§aVerkaufspreis: ${world.getDynamicProperty('diamond_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:diamond')
    .button(1, 'Smaragd', [`§aVerkaufspreis: ${world.getDynamicProperty('emerald_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:emerald')
    .button(2, 'Netherite', [`§aVerkaufspreis: ${world.getDynamicProperty('netherite_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:netherite_ingot')
    .button(3, 'Gold', [`§aVerkaufspreis: ${world.getDynamicProperty('gold_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:gold_ingot')
    .button(4, 'Kupfer', [`§aVerkaufspreis: ${world.getDynamicProperty('copper_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:copper_ingot')
    .button(5, 'Kohle', [`§aVerkaufspreis: ${world.getDynamicProperty('coal_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:coal')
    .button(6, 'Redstone Staub', [`§aVerkaufspreis: ${world.getDynamicProperty('redstone_price')} `, 'Klicke um weiter zu gehen.'], 'minecraft:redstone')
    .button(7, 'Eisen', [`§aVerkaufspreis: ${world.getDynamicProperty('iron_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:iron_ingot')
    .button(8, 'Quartz', [`§aVerkaufspreis: ${world.getDynamicProperty('quartz_price')} `, '§7Klicke um weiter zu gehen.'], 'minecraft:quartz')
    .button(9, '§cZurück', ['§7Gehe eine Seite zurück'], 'minecraft:barrier')
    .pattern([
      '_________',
      '_gggggggg',
    ], {
      g: { texture: 'textures/blocks/glass_gray' },
    })
  ui.show(player).then((r) => {
    if (r.canceled) return;

    switch (r.selection) {
      case 0:
        newSell(player, 'Diamant', 'semmel:gen_diamond', 'minecraft:diamond', world.getDynamicProperty('diamond_price'), true, oreSell)
        break;
      case 1:
        newSell(player, 'Smaragd', 'semmel:gen_emerald', 'minecraft:emerald', world.getDynamicProperty('emerald_price'), true, oreSell)
        break;
      case 2:
        newSell(player, 'Netherite', 'minecraft:netherite_ingot', 'minecraft:netherite_ingot', world.getDynamicProperty('netherite_price'), true, oreSell)
        break;
      case 3:
        newSell(player, 'Gold', 'semmel:gen_gold_ingot', 'minecraft:gold_ingot', world.getDynamicProperty('gold_price'), true, oreSell)
        break;
      case 4:
        newSell(player, 'Kupfer', 'semmel:gen_copper_ingot', 'minecraft:copper_ingot', world.getDynamicProperty('copper_price'), true, oreSell)
        break;
      case 5:
        newSell(player, 'Kohle', 'semmel:gen_coal', 'minecraft:coal', world.getDynamicProperty('coal_price'), true, oreSell)
        break;
      case 6:
        newSell(player, 'Roter Stein', 'minecraft:redstone', 'minecraft:redstone', world.getDynamicProperty('redstone_price'), true, oreSell)
        break;
      case 7:
        newSell(player, 'Eisen', 'semmel:gen_iron_ingot', 'minecraft:iron_ingot', world.getDynamicProperty('iron_price'), true, oreSell)
        break;
      case 8:
        newSell(player, 'Quartz', 'minecraft:quartz', 'minecraft:quartz', world.getDynamicProperty('quartz_price'), true, oreSell)
        break;
      case 18:
        sell(player)
        break;
      default:
        oreSell(player)
        break;
    }
  })
}
export function colorizeText(text, toggle = true) {
  let colorizedText = '';
  for (let char of text) {
    if (char === ' ') {
      colorizedText += char;
    } else {
      const color = toggle ? '§p' : '§7';
      colorizedText += color + char;
      toggle = !toggle;
    }
  }
  return colorizedText;
}

function allStats(player) {
  const allPlayers = world.getAllPlayers()
  const ui = new ModalFormData()
    .title('Player Stats')
    .dropdown('Von wem willst du die Stats sehen?', allPlayers.map(p => p.name))
    .toggle('Willst du deine Eigenen sehen? §7(Egal wen du ausgesucht hast)', true)
    .show(player).then((r) => {
      if (r.canceled) return;

      if (r.formValues[1] === true) return statsMenu(player, player)

      const selected = allPlayers[r.formValues[0]]
      statsMenu(player, selected)
    })
}
function statsMenu(viewer, player) {
  const ui = new ActionFormData()
    .title('Stats')
    .body(stats(player))
    .button('Ok')
    .show(viewer).then((r) => {
      if (r.canceled) return;

      gameMenu(viewer)
    })
}
/** View an Inventory
 * @param {Player} player The Viewer
 * @param {Player} target The Target
 */
function inventoryViewer(player, target) {
  const equip = target.getComponent('equippable');
  const inv = target.getComponent('inventory').container;
  const ui = new ChestFormData('54')
    .title(target.name)
  for (let i = 0; i < 36; i++) {
    const item = inv.getItem(i) ? inv.getItem(i) : undefined
    const ench = item?.getComponent('enchantable') && item?.getComponent('enchantable').getEnchantments() ? item.getComponent('enchantable').getEnchantments() : []
    const dur = item?.getComponent('durability') ? item.getComponent('durability').damage : 0
    if (item) {
      ui.button(i, item.nameTag ?? item.typeId.replace('minecraft:', '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), ench.map(e => [e.type.id.replace('minecraft:', '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), e.level].join(' ')), item.typeId, item.amount, dur, ench.length > 0 ? true : false)
    } else ui.button(i, '', [], 'minecraft:air', 0, 0, false)
  }
  const equipSlots = {
    head: { item: equip.getEquipment(EquipmentSlot.Head), slot: 45 },
    chest: { item: equip.getEquipment(EquipmentSlot.Chest), slot: 46 },
    leg: { item: equip.getEquipment(EquipmentSlot.Legs), slot: 47 },
    feet: { item: equip.getEquipment(EquipmentSlot.Feet), slot: 48 },
    mainHand: { item: equip.getEquipment(EquipmentSlot.Mainhand), slot: 50 },
    offHand: { item: equip.getEquipment(EquipmentSlot.Offhand), slot: 53 }
  }
  for (const equipment in equipSlots) {
    const slot = equipSlots[equipment]
    const item = slot.item
    if (item) {
      const ench = item.getComponent('enchantable')
      const dur = item.getComponent('durability')?.damage ?? 0
      const lore = ench?.getEnchantments() ?? []
      const enchanted = lore.length > 0
      ui.button(slot.slot, item.nameTag ?? item.typeId.replace('minecraft:', '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), [...lore.map(e => [e.type.id.replace('minecraft:', '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), e.level].join(" ")), equipment], item.typeId, item.amount, dur, enchanted)
    } else ui.button(slot.slot, '', [equipment], 'minecraft:air', 1, 0, false)
  }
  ui.pattern([
    '_________',
    '_________',
    '_________',
    '_________',
    'ggggggggg',
    '____g_gg_'
  ], {
    g: { texture: 'textures/blocks/glass_white' }
  })
  ui.show(player).then((r) => {
    if (r.cancelationReason === "UserBusy") {
      return system.runTimeout(() => inventoryViewer(player, target), 10);
    }
  })
}
const chatColors = ["§fWeiß", "§6Orange", "§7Grau", "§5Lila", "§4Dunkel Rot", "§3Hell Blau", "§2Grün", "§1Dunkel Blau", "§cRot", "§bAqua", "§eGelb"]
const colorCodes = ["§f", '§6', '§7', '§5', "§4", '§3', '§2', '§1', '§c', '§b', '§e']
/**
* @param {Player} player
*/
function gameMenu(player) {
  const time = new Date();
  const ui = new ActionFormData()
    .title('Game Menu')
    .body({ translate: 'semmel.gameMenu.text', with: [String(time.getDate()), String(time.getMonth() + 1), String(time.getFullYear()), String(time.getHours()), String(time.getMinutes())] })
    .button('Transfer Geld', 'textures/items/emerald')
    .button('Clan Menu', world.getDynamicProperty(`${player.getDynamicProperty('team')}Icon`))
    .button('Stats', 'textures/ui/inventory_icon')
    .button('Daily reward', 'textures/ui/daily_reward')
    .button('Kopfgeld Menu', 'textures/items/bow_pulling_2')
    .button('§7§gVIP §rMenu', 'textures/ui/filledStar')
    .button('§5§lPremium§r Menu', 'textures/items/totem')
    .button("§4§lChampion §rMenu", "textures/ui/permissions_op_crown")
  if (player.hasTag('admin')) {
    ui.button('Admin menu', 'textures/ui/Semmel')
  }
  ui.show(player).then((r) => {
    switch (r.selection) {
      case 0:
        coinsTransfer(player)
        break;
      case 1:
        if (player.getDynamicProperty('team') === 'none') {
          new Clan().noTeam(player)
        } else {
          new Clan().inTeam(player)
        }
        break;
      case 2:
        allStats(player)
        break;
      case 3:
        dailyReward(player)
        break;
      case 4:
        bountyMenu(player)
        break;
      case 5:
        if (player.hasTag('vip')) return vipMenu(player)
        break;
      case 6:

        break;
      case 8:
        adminMenu(player)
        break;
      default:
        break
    }
    if (r.cancelationReason === "UserBusy") {
      return system.runTimeout(() => gameMenu(player), 10);
    }
  })
}
/**
 * @param {Player} player
 */
function itemEditor(player) {
  const oldItem = player.getComponent('equippable').getEquipment('Mainhand')
  const allPlayers = world.getAllPlayers()
  const ui = new ModalFormData()
    .title('Item Editor')
    .textField('Item Name', 'Krasses Item')
    .textField('Lore (Nutze ; um eine zeile runter zu gehen.)', 'Das ist op;Töte alle!!!')
    .dropdown('Lock Mode', ['Lock in Inventory', 'Lock in Slot', 'Keine'], 2)
    .textField('Slot Nummer', '0')
    .slider("Anzahl", 1, 64, 1, 1)
    .dropdown('Wähle das Target aus', allPlayers.map(p => p.name))
  if (oldItem.getComponent('durability')) ui.slider('Der Damage', 0, oldItem.getComponent('durability').maxDurability, 1, 0)
  ui.show(player).then((r) => {
    if (r.canceled) return;

    system.run(() => {
      if (!oldItem) return player.sendMessage('§cDu musst was in deiner Main hand halten.')

      const newItem = new ItemStack(oldItem.typeId, r.formValues[4])
      if (r.formValues[0]) {
        newItem.nameTag = r.formValues[0]
      }
      if (r.formValues[1]) {
        const lore = r.formValues[1].trim().split(';').map(v => String(v))
        newItem.setLore(lore)
      }
      const lockMode = r.formValues[2] === 0 ? 'inventory' : r.formValues[2] === 1 ? 'slot' : 'none'
      newItem.lockMode = lockMode

      if (oldItem.getComponent('durability')) {
        newItem.getComponent('durability').damage = r.formValues[6]
      }
      const slot = parseInt(r.formValues[3])
      if (isNaN(slot)) return player.sendMessage('§cDer slot muss eine Zahl sein.')

      if (slot > 35 || slot < 0) return player.sendMessage('§cDer Slot muss eine Zahl Zwischen 0 und 35 sein.')

      const target = allPlayers[Number(r.formValues[5])]
      const inv = target.getComponent('inventory').container
      inv.setItem(slot, newItem)
    })
  })
}
function bountyMenu(player) {
  const ui = new ActionFormData()
    .title('Kopfgeld Menu')
    .body('Hier kannst du alles machen, was mit Kopfgeld Zutun hat.')
    .button('Setzte einen Kopfgeld', 'textures/items/bow_pulling_2')
    .button('Zeige alle Kopfgelder.', 'textures/ui/bounty')
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          setBountyMenu(player)
          break;
        case 1:
          allBountys(player)
          break;
      }
    })
}
function allBountys(player) {
  const bountyPlayer = world.getAllPlayers().filter(p => p.getDynamicProperty('bounty'))
  if (bountyPlayer.length <= 0) return player.sendMessage('§eKeine Spieler gefunden.')
  const text = bountyPlayer.length ? 'Alle Kopfgelder. §7Klick für mehr Details.' : 'Keine Kopfgelder gefunden.'
  const ui = new ActionFormData()
    .title('Kopfgelder')
    .body(text)
  bountyPlayer.forEach((p) => {
    let bounty = p.getDynamicProperty('bounty')
    bounty = bounty ? JSON.parse(bounty) : {}
    ui.button(`${p.name} \n§8Kopfgeld Summe: ${bounty.total.amount} `)
  })
  ui.button('Ok')
  ui.show(player).then((r) => {
    if (r.canceled) return;

    const selected = bountyPlayer[r.selection]
    if (!selected) return player.sendMessage('§cEtwas ist falch gelaufen.')
    specificBounty(player, selected)
  })
}
function specificBounty(viewer, player) {
  let bountyData = player.getDynamicProperty('bounty')
  bountyData = bountyData ? JSON.parse(bountyData) : {}
  const ui = new ActionFormData()
    .title(player.name)
    .body(`Info: \n§pKompletter Betrag§7: ${bountyData['total'].amount} \n§pDatum von der ersten Setzung§7: ${[bountyData.total.firstSet.day, bountyData.total.firstSet.month, bountyData.total.firstSet.year].join('.')} \nDas sind alle Spieler die auf ihn Kopfgeld gesetzt haben.`)
  if (bountyData) for (const setter in bountyData) ui.button(setter + '\n§8[Klick für mehr Details.]')
  ui.show(viewer).then((r) => {
    if (r.canceled) return;

    const selectedName = Object.keys(bountyData)[r.selection]
    specificBountySetter(viewer, player, selectedName)
  })
}
function specificBountySetter(viewer, player, setter) {
  let bountyData = player.getDynamicProperty('bounty')
  bountyData = bountyData ? JSON.parse(bountyData) : {}
  const setterData = bountyData[setter]
  const extra = setter === 'total' ? '' : `Letztes mal auf den Spieler gesetzt§7: ${[setterData.lastUpdate.day, setterData.lastUpdate.month, setterData.lastUpdate.year].join('.')} `
  const ui = new ActionFormData()
    .title(setter)
    .body(`§eInfo§f: \n§pBetrag§7: ${setterData.amount} \n§pErstes mal auf den Spieler gesetzt§7: ${[setterData.firstSet.day, setterData.firstSet.month, setterData.firstSet.year].join('.')} \n§p${extra} `)
    .button('Ok')
    .show(viewer).then((r) => {
      if (r.canceled) return;

      specificBounty(viewer, player)
    })
}
function setBountyMenu(player) {
  const allPlayers = world.getAllPlayers().filter(p => p.name !== player.name)
  if (allPlayers.length <= 0) return player.sendMessage('§eEs sind keine Spieler online.')
  const ui = new ModalFormData()
    .title('Kopfgeld')
    .dropdown('Wähle einen Spieler aus.', allPlayers.map(p => p.name))
    .textField('Gebe ein wie viel du setzten möchtest.', '100')
    .show(player).then((r) => {
      if (r.canceled) return;

      const target = allPlayers[r.formValues[0]]
      const amount = parseInt(r.formValues[1])
      if (!target) return player.sendMessage('§cDer Spieler ist nicht mehr im Spiel.')
      if (isNaN(amount) || amount <= 0) return player.sendMessage(`[Bounyt-System]: §cBitte gib eine positive Nummer ein.`)
      if (amount > score(player, 'geld')) return player.sendMessage(`[Bounty-System]: §cDu hast nicht genug Geld. §bDu hast §l${score(player, 'geld')} §r§bGeld.`)

      setBounty(target, player, amount)

    })
}
function vipMenu(player) {
  if (!player.hasTag('vip')) return console.warn(`${player.name} hat das vip menu geöffnet ohne vip`)
  const ui = new ActionFormData()
    .title('§lVIP Menu')
    .body('Hier sind die VIP-only Funktonen.')
    .button('Chat Name/Text Farbe', 'textures/ui/color_picker')
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          coloresMenu(player, "vip")
          break;
      }
    })
}
/**@param {Player} player */
function coloresMenu(player, perm = "vip") {
  const ui = new ActionFormData()
    .title('Chat Farbe')
    .button('Chat Name Farbe')
    .button('Chat Text Farbe')
    .show(player).then((r) => {
      if (r.canceled) return
      switch (r.selection) {
        case 0:
          chatColor(player, perm, true)
          break;
        case 1:
          chatColor(player, perm, false)
          break;
      }
    })
}
/**@param {Player} player */
function chatColor(player, perm = "vip", isName = true) {
  const permLvl = perm === "vip" ? chatColors.slice(0, 3) : perm === "premium" ? chatColors.slice(0, chatColors.length / 2) : perm === "champ" ? chatColors : undefined
  if (!permLvl) {
    console.warn('Falsche Perm Level für Chat color...')
    player.sendMessage('§cSorry! Der Coder hat ein Fehler gemacht, bitte wende dich an ein Community supporter.\n§tDiscord: https://discord.gg/U4e8W2UZ88')
  }
  const defaultValType = isName ? player.getDynamicProperty('chatNameColor') : player.getDynamicProperty('chatTextColor')
  const ui = new ModalFormData()
    .title('Chat Customizer')
    .label('Hier kannst du deine Chat Narichten so anpassen wie du es willst.')
    .dropdown('wähle eine Farbe aus', permLvl, colorCodes.indexOf(defaultValType))
    .show(player).then((r) => {
      if (r.canceled) return;
      const type = isName ? 'chatNameColor' : 'chatTextColor'
      player.setDynamicProperty(type, colorCodes[r.formValues[0]])
      player.sendMessage(`Chat Farben wurde auf ${chatColors[r.formValues[0]]} gesetzt.`)
    })
}
/**@type {{funcName: String; func: function}[]} */
const formFunctions = [
  {
    funcName: 'Money Transfer',
    func: coinsTransfer
  },
  {
    funcName: 'Shop',
    func: shop
  },
  {
    funcName: 'Sell',
    func: sell
  },
  {
    funcName: 'Stats',
    func: allStats
  },
  {
    funcName: "VIP Menu",
    func: vipMenu
  },
  {
    funcName: "Set Kopfgeld Menu",
    func: setBountyMenu
  },
  {
    funcName: "Alle Kopfegelder menu",
    func: allBountys
  }
]
/**
* @param {Player} player
*/
function adminMenu(player) {
  if (!player.isOp || !player.hasTag('admin')) return console.warn(`${player.name} hat das admin menu geöffnet ohne admin rechte`)
  const ui = new ActionFormData()
    .title('Admin Menu')
    .body('Das ist das Admin Menu. Nur für Admins. Reload Ne...')
    .button('Dynamic Property setter', 'textures/items/paper')
    .button('world dynamic Property', 'textures/ui/icon_book_writable')
    .button('Commands Per Page Setter', 'textures/blocks/command_block')
    .button('Spawn setter', "textures/items/compass_item")
    .button('Clan Creator', "textures/ui/FriendsIcon")
    .button('Verlosung!', 'textures/ui/gift_square')
    .button('Öffne Trollmenu für jemand', 'textures/items/fishing_rod_uncast')
    .button('Set me New', 'textures/blocks/barrier')
    .button('Give Knockback Stick', 'textures/items/stick')
    .button('Create Edited Item.', 'textures/items/arrow')
    .button('Test menu', 'textures/blocks/redstone_lamp_on')
  if (player.name === 'Ricc5967') {
    ui.button('Ricc Menu', 'textures/ui/shadow')
  }
  ui.show(player).then((r) => {
    if (r.canceled) return
    switch (r.selection) {
      case 0:
        dynProp(player)
        break;
      case 1:
        worldDynSetter(player)
        break;
      case 2:
        commandsPerPageSetter(player)
        break;
      case 3:
        spawn(player)
        break;
      case 4:
        clanCreat(player)
        break;
      case 5:
        const players = world.getAllPlayers().filter(p => p.hasTag('los'))
        const randomIndex = Math.floor(Math.random() * players.length)
        const selected = players[randomIndex]
        world.sendMessage(`[Verlosung]: §b${selected.name} hat gewonnen!`)
        world.playSound('random.levelup', { x: player.location.x, y: player.location.y, z: player.location.z })
        break;
      case 6:
        openMenuForSomeOne(player)
        break;
      case 7:
        setNew(player)
        break;
      case 8:
        const inv = player.getComponent('inventory').container
        const stick = new ItemStack('minecraft:stick')
        stick.setLore(['§7Knockback 100'])
        inv.addItem(stick)
        break;
      case 9:
        itemEditor(player)
        break;
      case 10:
        testMenu(player)
        break;
      case 11:
        new RiccMenu().main(player)
        break;
      default:
        break;
    }
  })
}
function commandsPerPageSetter(player) {
  const current = world.getDynamicProperty('cmdsPerPage') ? world.getDynamicProperty('cmdsPerPage') : 10
  const ui = new ModalFormData()
    .title('Commands Per Page')
    .textField('Wie viele Pro Seite', String(current))
    .show(player).then((r) => {
      if (r.canceled) return;

      world.setDynamicProperty('cmdsPerPage', Number(r.formValues[0]))
      player.sendMessage(`§aCommands Per Page sind jetzt ${r.formValues[0]}.`)
    })
}
function worldDynSetter(player) {
  const ui = new ModalFormData()
    .title('Wort Dynamic Property Setter')
    .textField('welche property (default für leute ohne clan)', 'noneIcon', 'noneIcon')
    .textField('Value', 'String; Number; Boolean')
    .label('Hinweiß:\n§9String: §fIrgendein Tect alles mögliche\n§9Number: §feine Zahl §7(Nützlich für sell/shop preis)\n§9Boolean: §atrue §foder §cfalse')
    .dropdown('Value Type', ['String', 'Number', 'Boolean'])
    .show(player).then((r) => {
      if (r.canceled) return;

      const value = r.formValues[2] === 0 ? String : r.formValues[2] === 1 ? Number : r.formValues[2] === 2 ? boolean : undefined
      world.setDynamicProperty(r.formValues[0], value(r.formValues[1]))
      player.sendMessage(`Die Property ${r.formValues[0]} wurde auf ${r.formValues[1]} gesetzt.`)
    })
}
/**
 * @param {Player} player
 */
function testMenu(player) {
  const ui = new ActionFormData()
    .title('Test menu')
    .body('Das muss nicht schön sein')
    .label({ translate: "pack.name" })
    .button('test toggle 2')
    .button('test view')
    .button('test shop')
    .button('test shop 16')
    .button('enchant mainhand item')
    .button('Chest')
    .show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          testToggleAdd(player)
          break;
        case 1:
          testDatas(player)
          break;
        case 2:
          newShop(player, 'Sick', 'minecraft:stick', 'minecraft:stick', 500, true, (() => { testMenu(player) }))
          break;
        case 3:
          newShop(player, 'Grass', 'minecraft:grass_block', 'minecraft:grass_block', 10, false, (() => { testMenu(player) }))
          break;
        case 4:
          const ench = new EnchantmentType('minecraft:knockback')
          const item = new ItemStack(player.getComponent('equippable').getEquipment('Mainhand').typeId)
          if (item) {
            item.getComponent('enchantable').addEnchantment({ type: ench, level: 2 })
            const inv = player.getComponent('inventory').container
            inv.setItem(player.selectedSlotIndex, item)
          }
          break;
        case 5:
          inventoryViewer(player, player)
          break;
      }
    })
}
function testToggleAdd(player) {
  const ui = new ModalFormData()
    .title('test')
    .textField('setTest', 'data')
    .toggle('reset Data', false)
    .show(player).then((r) => {
      if (r.canceled) return

      let test = player.getDynamicProperty('test')
      test = test ? JSON.parse(test) : {};
      if (test.hasOwnProperty(player.name)) {
        if (r.formValues[1] === true) {
          delete test[player.name]
          player.setDynamicProperty('test', JSON.stringify(test))
          player.sendMessage("ok, del")
        }
      } else {
        if (r.formValues[1] === true) return player.sendMessage('Du bist garned da')
      }
      const testValue = test[player.name] ? test[player.name] : { f: [] };
      testValue.f.push(r.formValues[0]); // Füge den Wert korrekt ins Array ein
      test[player.name] = testValue; // Setze das aktualisierte Objekt zurück
      player.setDynamicProperty('test', JSON.stringify(test))
      player.sendMessage('ok')
    })

}
function testDatas(player) {
  let data = player.getDynamicProperty('test')
  data = data ? JSON.parse(data) : {}
  const ui = new ActionFormData()
    .title('test')
    .body('hi')
  if (data) for (const setter in data) ui.button(setter)
  ui.button('ok')
    .show(player).then((r) => {
      if (r.canceled) return;

      const setterName = Object.keys(data)[r.selection]
      testDataPlayer(player, player, setterName)
    })
}
function testDataPlayer(viewer, target, setterName) {
  let data = target.getDynamicProperty('test')
  data = data ? JSON.parse(data) : {}
  const stats = data[setterName]
  const ui = new ActionFormData()
    .title(setterName)
    .body(`f: ${stats.f.join(', ')} `)
    .button('ok')
    .show(viewer)
}

function openMenuForSomeOne(player) {
  const allPlayers = world.getAllPlayers().filter(p => p.name !== player.name)
  const ui = new ModalFormData()
    .title('Öffne ein Menu (Spieler)')
    .dropdown('Spieler', allPlayers.map(p => p.name))
    .toggle('Zeige das menu für mich auch?')
    .textField('Title', 'Joke Form')
    .textField('text', 'Haha das ist ein joke')
    .textField('Button (Nutze ; für einen neuen button)', 'Klick mich!;Oder doch mich?')
    .show(player).then((r) => {
      if (r.canceled) return;

      const target = allPlayers[r.formValues[0]]
      const title = r.formValues[2]
      const text = r.formValues[3]
      const buttons = r.formValues[4].trim().split(';').map(v => String(v))
      const targets = r.formValues[1] === true ? [player, target] : [target]
      targets.forEach((viewer) => {
        const jokeForm = new ActionFormData()
          .title(title)
          .body(text)
        buttons.forEach((button) => {
          jokeForm.button(button)
        })
        jokeForm.show(viewer)
      })
    })
}

function dynProp(player) {
  const ui = new ModalFormData()
    .title('Dynamic Property Setter')
    .textField('Target', player.name, player.name)
    .textField('Dynamic Property Id', 'inCombat')
    .textField('Value', 'string; Number; Boolean; vector3')
    .dropdown('Value Type', ['String', 'Number', 'Boolean'])
    .toggle('Reset Property', false)
    .show(player).then((r) => {
      if (r.canceled) return
      const targetName = r.formValues[0]
      const target = world.getPlayers().find(p => p.name === targetName)
      if (!target) {
        player.sendMessage(`§cDer Spieler ${targetName} wurde nicht gefunden.`)
        return
      }
      if (r.formValues[4]) {
        target.setDynamicProperty(r.formValues[1])
        player.sendMessage('Resetet.')
        return;
      }
      const valueType = r.formValues[3] === 0 ? String : r.formValues[3] === 1 ? Number : boolean
      target.setDynamicProperty(r.formValues[1], valueType(r.formValues[2]))
      player.sendMessage(`Die Dynamic Property ${r.formValues[1]} wurde für ${target.name} auf ${r.formValues[2]} gesetzt.`)
    })
}
function spawn(player) {
  const ui = new ModalFormData()
    .title('Spawn Setter')
    .textField('Koordinaten', '0', `${player.location.x.toFixed(2)} ${player.location.y.toFixed(2)} ${player.location.z.toFixed(2)} `)
    .show(player).then((r) => {
      if (r.canceled) return
      const xyz = r.formValues[0].trim().split(' ', 3).map(v => Number(v))
      world.setDynamicProperty('spawn', { x: xyz[0], y: xyz[1], z: xyz[2] })
      player.sendMessage(`Der Spawn wurde gesetzt.`)
    })
}

function score(player, objective) {
  const obj = world.scoreboard.getObjective(objective);
  const score = obj.getScore(player);
  return score;
}
function addScore(player, objective, amount) {
  const obj = world.scoreboard.getObjective(objective);
  const scoreToAdd = obj.addScore(player, amount)
  return scoreToAdd;
}
/**
* @param {Player} player
* @param {string} objective
* @param {number} amount
*/
function removeScore(player, objective, amount) {
  const obj = world.scoreboard.getObjective(objective);
  const remoScore = obj.addScore(player, -amount);
  return remoScore;
}

function setScore(player, objective, amount) {
  const obj = world.scoreboard.getObjective(objective);
  const scoreToSet = obj.setScore(player, amount);
  return scoreToSet;
}
/**@param {String} string */
function boolean(string) {
  return string === "true" ? true : string === "false" ? false : undefined
}

function isInFlyingZone(x, y, z, horizontalBuffer = 0, verticalBuffer = 64) {
  const flyingZone = world.getDynamicProperty('flyZone') ? JSON.parse(world.getDynamicProperty('flyZone')) : {}
  return Object.values(flyingZone).some(area =>
    x >= (area.x1 - horizontalBuffer) && x <= (area.x2 + horizontalBuffer) &&
    z >= (area.z1 - horizontalBuffer) && z <= (area.z2 + horizontalBuffer) &&
    y >= -128 && y <= 384
  );
}
/**Wenn ein Bounty gesetzt wird!
 * @param {Player} target auf wem es ist
 * @param {Player} setter von wem es ist
 * @param {Number} amount Wie viel
 */
function setBounty(target, setter, amount) {
  let bounty = target.getDynamicProperty('bounty')
  bounty = bounty ? JSON.parse(bounty) : {}
  if (bounty.hasOwnProperty(setter.name)) {
    const values = bounty[setter.name]
    const oldAmount = values && values.amount ? values.amount : 0
    const newAmount = oldAmount + amount
    const update = {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
    const firstSetData = bounty[setter.name] && bounty[setter.name].firstSet ? bounty[setter.name].firstSet : update
    bounty[setter.name] = {
      amount: newAmount,
      firstSet: firstSetData,
      lastUpdate: update
    }
    const firstSetTotal = bounty['total'] && bounty['total'].firstSet ? bounty['total'].firstSet : update
    const totalAmountToAdd = bounty['total'] && bounty['total'].amount ? bounty['total'].amount : 0
    bounty["total"] = {
      amount: amount + totalAmountToAdd,
      firstSet: firstSetTotal
    } // I HAVE NO IDEA!!!
    system.run(() => {
      target.setDynamicProperty('bounty', JSON.stringify(bounty))
      removeScore(setter, 'geld', amount)
      setter.sendMessage(`§bDu hast Kopfgeld auf ${target.name} gesetzt.`)
      target.playSound('mob.creaking.deactivate')
      setter.playSound('block.end_portal_frame.fill')
    })
  } else {
    const time = {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
    bounty[setter.name] = {
      amount: amount,
      firstSet: time,
      lastUpdate: time
    }
    const addAmount = bounty['total'] && bounty['total'].amount ? bounty['total'].amount : 0
    bounty["total"] = {
      amount: amount + addAmount,
      firstSet: time
    }
    system.run(() => {
      target.setDynamicProperty('bounty', JSON.stringify(bounty))
      removeScore(setter, 'geld', amount)
      setter.sendMessage(`§bDu hast Kopfgeld auf ${target.name} gesetzt.`)
      target.playSound('mob.creaking.deactivate')
      setter.playSound('block.end_portal_frame.fill')
    })
  }
}

function dailyReward(player) {
  const time = new Date()
  const rewards = [
    'minecraft:enchanted_golden_apple',
    'minecraft:golden_apple',
    'minecraft:golden_apple',
    'minecraft:golden_apple',
    'minecraft:golden_apple',
    'minecraft:diamond_block',
    'minecraft:diamond_block',
    'minecraft:diamond_block',
    'minecraft:netherite_block',
    'minecraft:diamond',
    'minecraft:diamond',
    'minecraft:diamond',
    'minecraft:diamond',
    'minecraft:totem_of_undying',
    'minecraft:totem_of_undying'
  ]
  if (player.getDynamicProperty('dailyReward') === `${time.getDate()} ${time.getMonth()} ${time.getFullYear()} `) return player.sendMessage('[Daily-Reward]: §cDu hattest heute schon ein.')

  const randomIndex = Math.floor(Math.random() * rewards.length)
  player.setDynamicProperty('dailyReward', `${time.getDate()} ${time.getMonth()} ${time.getFullYear()} `)
  const inv = player.getComponent('minecraft:inventory').container
  const reward = new ItemStack(rewards[randomIndex], 1)
  inv.addItem(reward)
  player.sendMessage(`[Daily-Reward]: §aDu hast ${rewards[randomIndex].replace('minecraft:', '').replaceAll('_', ' ')} bekommen!\n§bKomm morgen wieder für ein weiteres Geschenk.`)
  player.playSound('random.levelup')
}

/**
* @param {Player} player
* @param {number} x1
* @param {number} z1
* @param {number} x2
* @param {number} z2
* @param {string} zoneName
*/
function addFlyZone(player, x1, z1, x2, z2, zoneName) {
  let zones = world.getDynamicProperty('flyZone')
  zones = zones ? JSON.parse(zones) : {}
  zones[zoneName] = {
    name: zoneName,
    x1: Math.min(x1, x2),
    z1: Math.min(z1, z2),
    x2: Math.max(x1, x2),
    z2: Math.max(z1, z2)
  }
  world.setDynamicProperty('flyZone', JSON.stringify(zones))
  player.sendMessage('§aFly Zone wurde erstellt.')
}

/**
* @param {Player} player
* @param {Player} target
* @param {number} amount
*/
function moneyTransfer(player, target, amount) {
  removeScore(player, 'geld', amount)
  addScore(target, 'geld', amount)
  player.sendMessage(`[Transfer-System]: §aErfolgreich das Geld an ${target.name} versendet.`);
  target.sendMessage(`[Transfer-System]: §a${player.name} hat dir ${amount} Geld gesendet.`);
  system.run(() => {
    player.playSound(`random.orb`);
    target.playSound(`random.orb`);
  })
}
function stats(player) {
  const stats = `§l§7» §r§gName§r: §g${player.name} \n§7§l» §r§aGeld§r: §a${score(player, "geld")} \n§7§l» §r§9Zeit§r: §9${score(player, "h")}h ${score(player, "min")}min ${score(player, "sek")} sec  \n§7§l» §r§cKills§r: §c${score(player, "kills")} \n§7§l» §r§tTode§r: §t${score(player, "deaths")} \n§7§l»§r §bKDR§r: §b${(score(player, 'kills') / score(player, 'deaths'))} \n§7§l»§r §5Team§r: ${player.getDynamicProperty('team')} \n§7§l»§r §eStatus§r: ${player.getDynamicProperty('inCombat')} `
  return stats
}
function sideBar(player) {
  const sideStats = `§l§7» §r§gName§r: §g${player.name} \n§7§l» §r§aGeld§r: §a${score(player, "geld")}  \n§7§l»§r §5Team§r: ${player.getDynamicProperty('team')} \n§7§l»§r §eStatus§r: ${player.getDynamicProperty('inCombat')}  \n§7§l»§r §bOnline: §2${world.getAllPlayers().length}§r/§420  \n§7§l»§r §fProbier §e:help§r  \n§7${[new Date().getDate(), new Date().getMonth() + 1, new Date().getFullYear()].join('.')} `
  return sideStats
}

world.afterEvents.itemUse.subscribe((e) => {
  const player = e.source
  const item = e.itemStack
  if (item.typeId === 'semmel:tp_semmel') {
    const direction = player.getViewDirection(); // Methode aufrufen
    player.teleport({
      x: player.location.x + direction.x * 2,
      y: player.location.y + direction.y,
      z: player.location.z + direction.z * 2
    });
    player.playSound('random.click')
  } else if (item.typeId === 'minecraft:compass' && player.hasTag('admin')) {
    gameMenu(player)
  } else if (item.typeId === 'minecraft:wooden_axe' && player.hasTag('admin') && eFill.get(player.name)) {
    eFill.delete(player.name)
    player.playSound('note.pling')
  }
})

function sendEmojis(player) {
  let emojiList = []

  for (const [emojiSyntax, emoji] of emojiMap) {
    emojiList.push(`${emojiSyntax} -> ${emoji} `);
  }

  if (emojiList.length > 0) {
    player.sendMessage(`§b§l» §r§b${emojiList.join('\n§l» §r§b')} `);
  } else {
    player.sendMessage('§cKeine Emojis gefunden.');
  }
}


/**
* @param {Player} player
* @param {number} seconds
*/
function clearLag(player, seconds) {
  system.runTimeout(() => {
    if (seconds > 0) {
      player.sendMessage(`§bLag Clear in: ${seconds} `)
      player.playSound('random.pop')
      clearLag(player, seconds - 1)
    } else {
      for (const items of player.dimension.getEntities({ type: "minecraft:item" })) {
        items.remove()
      }
      player.sendMessage('§aLag Cleared.')
      player.playSound('random.levelup')
    }
  }, 20)
}

system.runInterval(() => {
  world.sendMessage('§bLag Clear in: 15sek')
  system.runTimeout(() => {
    for (const player of world.getAllPlayers())
      clearLag(player, 10)
  }, 100)
}, 12000)

function countdown(player, seconds = 5, callback) {
  system.runTimeout(() => {
    if (seconds > 0) {
      const pos = player.getDynamicProperty('TpPos')
      if (pos.x !== player.location.x || pos.y !== player.location.y || pos.z !== player.location.z) {
        player.sendMessage('§cTeleport abgebrochen. Du hast dich bewegt.')
        player.playSound('random.glass')
        player.setDynamicProperty('TpPos', 'none')
      } else {
        player.sendMessage(`§eTeleportiere in: ${seconds} `)
        player.playSound('random.pop')
        countdown(player, seconds - 1, callback)
      }
    } else {
      callback(player)
    }
  }, 20)
}

function hasEnoughItems(player, itemId, minCount) {
  const inventory = player.getComponent("minecraft:inventory").container;
  let totalCount = 0;

  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getItem(i);
    if (slot && slot.typeId === itemId) {
      totalCount += slot.amount;
    }
  }

  return totalCount >= minCount;
}
function fill(x1, y1, z1, x2, y2, z2, blockType, dim) {
  const dimension = world.getDimension(dim);

  // Bestimme die minimale und maximale Koordinate für eine korrekte Reihenfolge
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const minZ = Math.min(z1, z2);
  const maxZ = Math.max(z1, z2);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        dimension.getBlock({ x: x, y: y, z: z })?.setType(BlockTypes.get(blockType));
      }
    }
  }
}

function clanCreat(player) {
  const noTeamPlayers = world.getAllPlayers().filter(p => p.getDynamicProperty('team') === 'none').filter(p => p.getDynamicProperty('clanOwner') === false)
  const ui = new ModalFormData()
    .title('Clan Maker')
    .dropdown('Wähle den Clan Owner aus', noTeamPlayers.map(p => p.name))
    .textField('Clan Name', 'Mein Clan')
    .show(player).then((r) => {
      if (r.canceled) return;

      const targetOwner = noTeamPlayers[r.formValues[0]]
      const clanName = r.formValues[1]
      targetOwner.setDynamicProperty('team', clanName)
      targetOwner.setDynamicProperty('clanOwner', clanName)
      targetOwner.setDynamicProperty('teamRequest', 'none')
      targetOwner.setDynamicProperty('teamInvite', 'none')
      targetOwner.sendMessage(`[Clan-System]: §aDu bist jetzt der Owner vom ${clanName} Clan.`)
      player.sendMessage(`[Clan-System]: §aDu hast ${targetOwner.name} zum Clan Owner vom ${clanName} ernannt.`)
      world.setDynamicProperty(`${clanName}Icon`, 'textures/ui/FriendsIcon')
    })
}

class Clan {
  inTeam(player) {
    let clanOwner = world.getPlayers().filter(p => p.getDynamicProperty('clanOwner') === player.getDynamicProperty('team'))
    clanOwner = clanOwner.length ? clanOwner.map(p => p.name) : ['Offline']
    const ui = new ActionFormData()
      .title('Clan Menu')
    ui.body(`Das ist das Clan Menu.\nDein Clan: ${player.getDynamicProperty('team')} \n§rClan Owner: ${clanOwner} `)
    ui.button('Sende eine Clan Nachricht', 'textures/items/name_tag')
      .button('Clan Members', 'textures/ui/FriendsIcon')
    if (player.getDynamicProperty('clanOwner') === player.getDynamicProperty('team')) {
      ui.button('Sende Clan Einladung', 'textures/items/paper')
      ui.button('Einkommende Clan Anfragen', 'textures/ui/check')
      ui.button('Bearbeite Clan Member', 'textures/ui/Friend1')
      ui.button('Setze eine Clan Texture', 'textures/blocks/cartography_table_top')
    }
    ui.button('§cVerlasse den Clan', 'textures/ui/crossout')
    ui.show(player).then((r) => {
      if (r.canceled) return;

      if (player.getDynamicProperty('clanOwner') !== player.getDynamicProperty('team')) {
        switch (r.selection) {
          case 0:
            new Clan().nachricht(player)
            break;
          case 1:
            new Clan().clanMemebers(player)
            break;
          case 2:
            new Clan().sureToLeaveMessage(player)
            break;
          default:
            player.sendMessage('[Clan-System]: §4Du solltest das nicht können.')
            console.warn(`${player.name} hat einen Weg gefunden clan Owner sachen zu machen ohne Clan Owner rechte.`)
            break;
        }
      }

      if (player.getDynamicProperty('clanOwner') === player.getDynamicProperty('team')) {
        switch (r.selection) {
          case 0:
            if (player.hasTag('mute')) return player.sendMessage('§cDu bist gestummt.')
            new Clan().nachricht(player)
            break;
          case 1:
            new Clan().clanMemebers(player)
            break;
          case 2:
            new Clan().clanInvite(player)
            break;
          case 3:
            new Clan().clanAnfragen(player)
            break;
          case 4:
            new Clan().editMembers(player)
            break;
          case 5:
            new Clan().teamTexture(player)
            break;
          case 6:
            if (player.getDynamicProperty('clanOwner') === player.getDynamicProperty('team')) {
              new Clan().isOwnerLeaveMessage(player)
              return;
            }
            new Clan().sureToLeaveMessage(player)
            break;
        }
      }
    })
  }
  sureToLeaveMessage(player) {
    const ui = new MessageFormData()
      .title('Verlassen?')
      .body('Bist du sicher das du deinen Clan verlassen möchtest?')
      .button1('Zurück')
      .button2('§cVerlassen')
    ui.show(player).then((r) => {
      if (r.canceled) return;

      if (r.selection === 0) return new Clan().inTeam(player)

      if (r.selection === 1) {
        player.setDynamicProperty('team', 'none')
        player.setDynamicProperty('clanChat', false)
        player.sendMessage('[Clan-System]: §cDu hast dein Clan verlassen.')
      }
    }).catch(error => {
      player.sendMessage(error)
    })

  }
  isOwnerLeaveMessage(player) {
    const ui = new MessageFormData()
      .title('Verlassen')
      .body('Du bist der Clan Owner. Du kannst dein Clan nicht verlassen. Beförder jemand anderem zum Clan Owner, um zu verlassen. Du machst dies in §lClan Menu » Bearbeite Clan Member » [Member auswählen] » Zum anführer ernennen§r.')
      .button1('Ok')
      .button2('Gehe zu allen Members')
      .show(player).then((r) => {
        if (r.canceled) return;
        if (r.selection === 0) return new Clan().inTeam(player)

        if (r.selection === 1) return new Clan().editMembers(player)
      })
  }
  editMembers(player) {
    const members = world.getAllPlayers().filter(p => p.getDynamicProperty('team') === player.getDynamicProperty('team')).filter(p => p.name !== player.name)
    if (members.length < 1) return player.sendMessage('§eKeine Spieler gefunden.')
    const ui = new ModalFormData()
      .title('Bearbeite Member')
      .dropdown('Wähle einen Clan Member aus.', members.map(p => p.name))
      .dropdown('Wähle eine option aus.', ['Als Anführer ernennen', 'Kicken'])
      .show(player).then((r) => {
        if (r.canceled) return;

        const selectedMember = members[r.formValues[0]]
        switch (r.formValues[1]) {
          case 0:
            system.run(() => {
              selectedMember.setDynamicProperty('clanOwner', player.getDynamicProperty('team'))
              selectedMember.sendMessage('[Clan-System]: §aDu wurdest als Clan Owner ernannt.')
              player.setDynamicProperty('clanOwner', false)
              player.sendMessage(`[Clan-System]: §eDu hast ${selectedMember.name} als Owner ernannt.`)
            })
            break;
          case 1:
            system.run(() => {
              selectedMember.setDynamicProperty('team', 'none')
              selectedMember.setDynamicProperty('clanChat', false)
              selectedMember.sendMessage('[Clan-System]: §cDu wurdest aus deinem Clan gekickt.')
              player.sendMessage(`[Clan-System]: §eDu hast ${selectedMember.name} gekickt.`)
            })
            break;
        }
      })
  }
  nachricht(player) {
    const clanMember = world.getAllPlayers().filter(p => p.getDynamicProperty('team') === player.getDynamicProperty('team'))
    const ui = new ModalFormData()
      .title('Clan Nachricht')
      .textField('Schreibe deine Nachricht', 'Hallo Clan Members')
      .show(player).then((r) => {
        if (r.canceled) return;

        if (!r.formValues[0]) return player.sendMessage('Das Textfeld darf nicht lehr sein.');
        clanMember.forEach((member) => {
          member.sendMessage(`§f[§aClan Nachricht von §7${player.name}§r§f]: ${r.formValues[0]} `)
        })
      })
  }
  clanMemebers(player) {
    const members = world.getAllPlayers().filter(p => p.getDynamicProperty('team') === player.getDynamicProperty('team')).filter(p => p.getDynamicProperty('teamInvite') === 'none').filter(p => p.getDynamicProperty('clanOwner') === false)
    const clanOwner = world.getPlayers().filter(p => p.getDynamicProperty('clanOwner') === player.getDynamicProperty('team'))
    const ui = new ActionFormData()
      .title('Clan Members')
      .body(`Owner: ${clanOwner.map(p => p.name)} \nMembers: ${members.map(p => p.name).join('\n')} `)
      .button('Ok')
      .show(player)
  }
  clanInvite(player) {
    const allPlayers = world.getAllPlayers().filter(p => p.name !== player.name).filter(p => p.getDynamicProperty('team') === 'none')
    if (allPlayers.length <= 0) return player.sendMessage('Keine Spieler gefunden.')
    const ui = new ModalFormData()
      .title('Einladung Versenden')
      .dropdown('Wen willst du einladen?', allPlayers.map(p => p.name))
      .textField('(Optional) Schreibe eine Nachricht dazu.', 'Hallo, Spieler...', '/')
      .show(player).then((r) => {
        if (r.canceled) return;

        const target = allPlayers[r.formValues[0]]
        const msg = r.formValues[1]
        target.setDynamicProperty('teamInvite', player.getDynamicProperty('team'))
        target.setDynamicProperty('inviteMsg', msg)
        target.sendMessage(`[Clan-System]: §eDu wurdest zum Clan ${target.getDynamicProperty('teamInvite')} eigeladen.Diese Einladung wird in 1min ablaufen.`)
        player.sendMessage(`[Clan-System]: §aDu hast ${target.name} in dein Clan eingeladen.`)
        system.runTimeout(() => {
          target.setDynamicProperty('teamInvite', 'none')
          target.setDynamicProperty('inviteMsg', 'none')
          target.sendMessage('[Clan-System]: §cDeine Einladung ist abgelaufen.')
          player.sendMessage(`[Clan-System]: Deine Einladung an ${target.name} ist abgelaufen.`)
        }, 20 * 60)
      })
  }

  noTeam(player) {
    const ui = new ActionFormData()
      .title('Clan Menu')
      .body('Du hast keinen Clan.')
      .button('Versende eine Clan Beitritts Anfrage')
    if (player.getDynamicProperty('teamInvite') !== 'none') {
      ui.button(`Clan Einladungen(${player.getDynamicProperty('teamInvite')})`)
    }
    ui.show(player).then((r) => {
      if (r.canceled) return;

      switch (r.selection) {
        case 0:
          new Clan().teams(player)
          break;
        case 1:
          new Clan().teamInvites(player)
          break;
      }
    })
  }
  clanAnfragen(player) {
    const ui = new ActionFormData()
      .title('Clan Anfragen')
      .body('Alle Clan Anfragen')
    const requester = world.getAllPlayers().filter(p => p.getDynamicProperty('teamRequest') === player.getDynamicProperty('team'))
    if (requester.length <= 0) return player.sendMessage('Keine Anfragen wurden gefunden')
    requester.forEach((request) => {
      ui.button(request.name)
    })
    ui.show(player).then((r) => {
      if (r.canceled) return;

      const target = requester[r.selection]
      new Clan().anfrage(player, target)
    })
  }
  anfrage(player, target) {
    const ui = new ActionFormData()
      .title(`Anfrage von ${target.name} `)
      .body(`Anfregen Text: ${target.getDynamicProperty('teamRequestText')} `)
      .button('Anfrage annehmen')
      .button('§cAnfrage ablehnen')
      .button('§cZurück')
      .show(player).then((r) => {
        if (r.canceled) return;

        switch (r.selection) {
          case 0:
            target.setDynamicProperty('team', player.getDynamicProperty('team'))
            target.setDynamicProperty('teamInvite', 'none')
            target.setDynamicProperty('teamRequest', 'none')
            target.sendMessage(`[Clan-System]: §aDu bist dem ${player.getDynamicProperty('team')} Clan beigetreten.`)
            target.playSound('random.levelup')
            player.sendMessage(`[Clan-System]: §aDu hast die Anfrage von ${target.name} angenommen.`)
            break;
          case 1:
            target.setDynamicProperty('teamRequest', 'none')
            target.setDynamicProperty('teamRequestText', 'none')
            target.sendMessage(`[Clan-System]: §cDeine Anfrage an den ${player.getDynamicProperty('team')} Clan wurde abgelehnt.`)
            player.sendMessage(`[Clan-System]: §eDu hast die Anfrage von ${target.name} abgelehnt.`)
            break;
          case 2:
            new Clan().clanAnfragen(player)
            break;
        }
      })
  }

  teamInvites(player) {
    const ui = new ActionFormData()
      .title('Invite')
      .body(`Möchtest du dem ${player.getDynamicProperty('teamInvite')} beitreten ?\nNachricht: ${player.getDynamicProperty('inviteMsg')} `)
      .button('Beitreten')
      .button('§cAblehnen')
      .show(player).then((r) => {
        if (r.canceled) return;

        switch (r.selection) {
          case 0:
            player.setDynamicProperty('team', player.getDynamicProperty('teamInvite'))
            player.setDynamicProperty('teamInvite', 'none')
            player.sendMessage(`[Clan-System]: §aDu bist dem ${player.getDynamicProperty('team')} beigetreten.`)
            player.playSound('random.levelup')
            const owner = world.getPlayers().find(p => p.getDynamicProperty('teamOwner') === player.getDynamicProperty('team'))
            owner.sendMessage(`[Clan-System]: §a${player.name} ist deinem Clan beigetreten.`)
            owner.playSound('random.levelup')
            break;
          case 1:
            player.setDynamicProperty('teamInvite', 'none')
            player.sendMessage('[Clan-System]: §eDu hast die Einladung abgelehnt.')
            owner.sendMessage(`[Clan-System]: §c${player.name} hat deine Einladung abgelehnt.`)
            break;
        }
      })
  }
  teams(player) {
    const teamOwner = world.getAllPlayers().filter(p => p.getDynamicProperty('clanOwner') !== false)
    if (teamOwner.length <= 0) return player.sendMessage('Keine Clans gefunden.')
    const ui = new ActionFormData()
      .title('Clans')
      .body('Alle Clans, denen du eine anfrage senden kannst.')
    teamOwner.forEach((owner) => {
      ui.button(owner.getDynamicProperty('clanOwner'))
    })
    ui.show(player).then((r) => {
      if (r.canceled) return;

      const selectedOwner = teamOwner[r.selection]
      const selectedTeam = selectedOwner.getDynamicProperty('clanOwner')
      new Clan().teamRequestSend(player, selectedTeam)
    })
  }
  teamRequestSend(player, team) {
    const ui = new ModalFormData()
      .title(team)
      .textField('Schreibe einen kurzen Text.', 'Ich möchte ins Team.')
      .show(player).then((r) => {
        if (r.canceled) return;
        if (!r.formValues[0]) return player.sendMessage('[Clan-System]: §cDu musst was schreiben.')

        player.setDynamicProperty('teamRequest', team)
        player.setDynamicProperty('teamRequestText', r.formValues[0])
        player.sendMessage('[Clan-System]: §aAnfrage wurde gesendet.')
        world.getPlayers().find(p => p.getDynamicProperty('teamOwner') === team).sendMessage(`[Clan-System]: §e${player.name} hat eine Anfrage gesendet deinem Clan beizutreten.`)
      })
  }
  /**
* @param {Player} player
*/
  teamTexture(player) {
    const team = player.getDynamicProperty('team')
    const ui = new ModalFormData()
      .title('Clan Texture')
      .textField('File Path', 'textures/ui/FriendsIcon')
      .toggle('Reset tu default?', false)
      .show(player).then((r) => {
        if (r.canceled) return;
        if (r.formValues[1] === true) {
          world.setDynamicProperty(`${team}Icon`, 'textures/ui/FriendsIcon')
          player.sendMessage('[Clan-System]: §bClan Texture wurde resetet.')
        } else {
          world.setDynamicProperty(`${team}Icon`, r.formValues[0])
          player.sendMessage(`[Clan-System]: §aClan Texture wurde auf ${r.formValues[0]} gesetzt.`)
        }
      })
  }
}



class TpsCalculator {
  constructor() {
    this.lastTick = 0;
    this.lastTime = Date.now();
    this.tps = 0;

    system.runInterval(() => this.updateTPS(system.currentTick), 10);
  }

  updateTPS(currentTick) {
    const currentTime = Date.now();
    const tickDifference = currentTick - this.lastTick;
    const timeDifference = (currentTime - this.lastTime) / 1000;

    if (timeDifference > 0) {
      this.tps = tickDifference / timeDifference;
    }

    this.lastTick = currentTick;
    this.lastTime = currentTime;
  }

  getTPS() {
    return this.tps;
  }
}


const tpsCalculator = new TpsCalculator();

export function pullTPS() {
  return tpsCalculator.getTPS();
}

const emojiMap = new Map([
  [':scull:', ''],
  [':players:', ''],
  [':+:', ''],
  [':-:', ''],
  [':arrow_up:', ''],
  [':arrow_down:', ''],
  [':discord:', ''],
  [':youtube:', ''],
  [':instagram:', ''],
  [':twitch:', ''],
  [':sword:', ''],
  [':trophy:', ''],
  [':golden_apple:', ''],
  [':right:', ''],
  [':wrong:', ''],
  [':rain:', ''],
  [':lightning:', ''],
  [':crown:', ''],
  [':sand_clock:', ''],
  [':name_tag:', ''],
  [':pencil:', ''],
  [':heart;', ''],
  [':smile:', ''],
  [':laugh:', ''],
  [':happy:', ''],
  [':cry:', ''],
  [':sad:', ''],
  [':annoyed:', ''],
  [':angry:', ''],
  [':shocked:', ''],
  [':smile_tear:', '']
]);

/*function mainTick() {
  if (system.currentTick % 100 === 0) {
    world.sendMessage("Hello custom commands! Tick: " + system.currentTick)
  }

  system.run(mainTick)
}

system.beforeEvents.startup.subscribe(init => {
  const helloCommand = {
    name: "creator:hellocustomcommand",
    description: "Celebration super party hello",
    permissionLevel: CustomCommandPermissionLevel.Any,
    optionalParameters: [
      { type: CustomCommandParamType.Integer, name: "celebrationSize" }
    ]
  }
  init.customCommandRegistry.registerCommand(helloCommand, helloCustomCommand)

  const partyCommand = {
    name: "creator:party",
    description: "Cause selected entities to party",
    permissionLevel: CustomCommandPermissionLevel.GameDirectors,
    mandatoryParameters: [
      { type: CustomCommandParamType.EntitySelector, name: "partyParticipants" }
    ]
  }
  init.customCommandRegistry.registerCommand(partyCommand, party)

  const dirtsterCommand = {
    name: "creator:dirtster",
    description: "Adds some dirt, ster",
    permissionLevel: CustomCommandPermissionLevel.GameDirectors,
    mandatoryParameters: [
      { type: CustomCommandParamType.Position, name: "dirtLocation" }
    ]
  }
  init.customCommandRegistry.registerCommand(dirtsterCommand, dirtster)
})

function helloCustomCommand(celebrationSize) {
  world.sendMessage("Hello Custom Command!")

  if (celebrationSize) {
    system.run(() => {
      for (const player of world.getPlayers()) {
        player.dimension.createExplosion(player.location, celebrationSize)
      }
    })
  }

  return {
    status: CustomCommandStatus.Success
  }
}

function party(entities) {
  world.sendMessage("Entity party!")

  system.run(() => {
    for (const entity of entities) {
      entity.applyImpulse({ x: 0, y: 1, z: 0 })
      entity.dimension.spawnParticle(
        "minecraft:ominous_spawning_particle",
        entity.location
      )
    }
  }) //

  return {
    status: CustomCommandStatus.Success
  }
}

function dirtster(loc) {
  world.sendMessage("Lets get dirty!")

  system.run(() => {
    const dim = world.getDimension("overworld")

    dim.setBlockType(loc, "minecraft:dirt")

    // it's a mini dirt pyramid
    dim.setBlockType({ x: loc.x + 2, y: loc.y + 1, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x - 2, y: loc.y + 1, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x + 1, y: loc.y + 1, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x - 1, y: loc.y + 1, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x, y: loc.y + 1, z: loc.z }, "minecraft:dirt")

    dim.setBlockType({ x: loc.x + 1, y: loc.y + 2, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x - 1, y: loc.y + 2, z: loc.z }, "minecraft:dirt")
    dim.setBlockType({ x: loc.x, y: loc.y + 2, z: loc.z }, "minecraft:dirt")

    dim.setBlockType({ x: loc.x, y: loc.y + 3, z: loc.z }, "minecraft:dirt")
  }) //

  return {
    status: CustomCommandStatus.Success
  }
}* /

/* Für später
const fullMessage = args.join(" ");
 
// Regex: Erlaubt sowohl "Spieler Name" als auch SpielerName ohne ""
const match = fullMessage.match(/^"(.*?)"\s+(\d+)\s*(.*)$|^(\S+)\s+(\d+)\s*(.*)$/);
 
if (!match) { 
    player.sendMessage('§cBitte nutze: §e/bounty "Spieler Name" Betrag Nachricht §coder §e/bounty SpielerName Betrag Nachricht');
        return;
        }
 
        const targetName = match[1] || match[4]; // Name in "" oder erstes Wort
        const amount = parseInt(match[2] || match[5]); // Betrag als Zahl
        const message = (match[3] || match[6]).trim(); // Nachricht, falls vorhanden
 
        if (isNaN(amount) || amount <= 0) {
            player.sendMessage('§cDer Betrag muss eine positive Zahl sein!');
                return;
                }
 
                player.sendMessage(`Debug: targetName = "${targetName}", amount = ${ amount }, message = "${message}"`);
*/


/**To do:
 * report system ^"(.*?)"\s+"(.*?)"(?:\s+(.*))?$|^(\S+)\s+"(.*?)"\s*(.*)?$
 * bounty system
 * chat, name color
 */

/**@type {Player} player */
class RiccMenu {
  main(player) {
    if (player.name !== 'Ricc5967') return
    const ui = new ActionFormData()
      .title('Riccs Lounch')
      .body('Ricc\'s private lounch')
      .button("Damage")
      .show(player).then((r) => {
        if (r.canceled) return
        switch (r.selection) {
          case 0:
            new RiccMenu().damage(player)
            break;
        }
      })
  }
  damage(player) {
    const ui = new ModalFormData()
      .title('damage')
      .toggle('enable damage?', player.getDynamicProperty(RICC_KEY))
      .show(player).then((r) => {
        if (r.canceled) return;

        player.setDynamicProperty(RICC_KEY, r.formValues[0])
      })
  }
}
