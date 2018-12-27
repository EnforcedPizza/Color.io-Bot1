const Discord = require("discord.js");
const client = new Discord.Client();

const color_convert = require("color-convert");
const { spawn } = require('child_process');
const fs = require('fs');

const config = require("./config.json");
const generate_embed = require("./generate_simple_embed.js");
const urban_palettes = require("./color_palettes_urban.json");
const nature_palettes = require("./color_palettes_nature.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(` with Python`);
});

const color_types = ['hex', 'rgb', 'int', 'hsl', 'hsv', 'cmyk'];

client.on("message", async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    
    const args = message.content.slice(config.prefix.length).trim().toLowerCase().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == 'help'){
        let fields = [
            {
                'name': 'c!palette <set>',
                'value': 
                    '  * Generates pseudo-random palette\n' +
                    '  - <set> can be either nature or urban\n' +
                    '  > c!palette nature'
            },
            {
                'name': 'c!convert <input> <desired output> <color>',
                'value': 
                    '  * Converts color formats to each other\n' +
                    '  - <input> is the color format of the input color (i.e. hex, rgb)\n' +
                    '  - <desired output> is the color format you wish to convert <input> into\n' +
                    '  - <color> is the your color in <input> format\n' +
                    '  > c!convert rgb hex 100 150 200'
            },
            {
                'name': 'c!view <input> <color>',
                'value': 
                    '  * Displays square of inputted color\n' +
                    '  - <input> is the color format of the input color (i.e. hex, rgb)\n' +
                    '  - <color> is the your color in <input> format\n' +
                    '  > c!view rgb 111 122 223'
            },
            {
                'name': 'Supported color types:',
                'value': '  - hex, rgb, int, hsl, hsv, cmyk'
            }
            ,
            {
                'name': 'c!formathelp',
                'value': '  - View specific formatting for each color format'
            }
        ]
        let embed = {
            embed: {
                "url": "https://discordapp.com",
                "color": 7171437,
                "timestamp": "2018-12-23T05:19:10.633Z",
                "footer": {
                    "text": "League of RPG Bot | @The3DSquare"
                },
                "author": {
                    "name": 'Commands',
                    "icon_url": message.author.avatarURL
                },
                "fields": fields
            }
        }  
        
        message.channel.send(embed).catch(err => console.log(err));
    }
 
    else if(command == 'formathelp'){
        let fields = [
            {
                'name': 'rgb',
                'value': 
                    '  - <Red> <Green> <Blue>\n' +
                    '  > c!view rgb 100 100 100'
            },
            {
                'name': 'hex',
                'value': 
                    '  - <Hex Number>\n' +
                    '  > c!view hex 0000ff'
            },
            {
                'name': 'int',
                'value': 
                    '  - <Integer>\n' +
                    '  > c!view int 100000'
            },
            {
                'name': 'cmyk',
                'value': 
                    '  - <Cyan> <Magenta> <Yellow> <Key(Black)>\n' +
                    '  > c!view cmyk 100 100 100 100'
            },
            {
                'name': 'hsl',
                'value': 
                    '  - <Hue> <Saturation> <Level>\n' +
                    '  > c!view hsl 100 100 100'
            },
            {
                'name': 'hsv',
                'value': 
                    '  - <Hue> <Saturation> <Value>\n' +
                    '  > c!view hsv 100 100 100'
            },
        ]
        let embed = {
            embed: {
                "url": "https://discordapp.com",
                "color": 7171437,
                "timestamp": "2018-12-23T05:19:10.633Z",
                "footer": {
                    "text": "League of RPG Bot | @The3DSquare"
                },
                "author": {
                    "name": 'Commands',
                    "icon_url": message.author.avatarURL
                },
                "fields": fields
            }
        }  
        
        message.channel.send(embed).catch(err => console.log(err));
    }

    else if(command == 'convert'){
        if(color_types.includes(args[0]) && color_types.includes(args[1])){
            if(args[0] == args[1]){
                let error_embed = await generate_embed('Error with conversion', 'Cannot convert color format to itself');
                message.channel.send(error_embed);
                return;
            }
            let color; let display_color;

            if(args[0] == 'int'){
                display_color = args.slice(2)[0];
                int_2_hex = String('000000' + parseInt(display_color).toString(16)).slice(-6);
                if(args[1] != 'hex'){
                    color = color_convert.hex[args[1]](int_2_hex);
                } else {
                    color = int_2_hex;
                }
            } else if(args[1] == 'int'){
                //hex_2_int = parseInt(args.slice(2)[0], 16);
                if(args[0] != 'hex'){
                    color = parseInt(color_convert[args[0]].hex(args.slice(2)), 16);
                } else {
                    color = parseInt(args.slice(2)[0], 16);
                }
                display_color = color;
            } else {
                try {
                    color = color_convert[args[0]][args[1]](args.slice(2));
                    if(args[1] == 'hex'){
                        display_color = parseInt(color, 16);
                    } else {
                        display_color = parseInt(color_convert[args[1]].hex(color), 16);
                    }
                } catch(err){
                    let error_embed = await generate_embed('Error with conversion', 'Invalid format in command use - Use c!help for more information');
                    message.channel.send(error_embed);
                    return;
                }
            }
            
            if(!(color instanceof Array)) color = [color];
            color.map((x) => {
                if(x == NaN) return '0';
            });

            let embed = await generate_embed(`Converted ${args[0].toLowerCase()} to ${args[1].toLowerCase()}`, `(${args.slice(2).join(', ')}) converted to **(${color.join(', ').toLowerCase()})**`, display_color);
            message.channel.send(embed);
        } else {
            let error_embed = await generate_embed('Improper command use', 'Correct usage is c!convert <input> <desired output> <color>\nCheck for **typos** as well');
            message.channel.send(error_embed).catch(err => console.log(err));
        }
    }

    else if(command == 'view'){
        if(color_types.includes(args[0])){
            let rgb; let trailing_args;
            try {
                if(args[0] == 'rgb'){
                    trailing_args = args.splice(1);
                    rgb = trailing_args;
                } else if(args[0] == 'int') {
                    trailing_args = args.splice(1);
                    hexified = parseInt(trailing_args[0]).toString(16);
                    rgb = color_convert.hex.rgb(hexified);
                } else {
                    trailing_args = args.splice(1);
                    rgb = color_convert[args[0]].rgb(trailing_args);
                }
            } catch (err) {
                let error_embed = await generate_embed('Error with conversion', 'Invalid format in command use - Check for typos');
                message.channel.send(error_embed);
                return;
            }

            let int = parseInt(color_convert.rgb.hex(rgb), 16);

            let process = spawn(`python`, ['color.py', rgb[0], rgb[1], rgb[2], message.author.id]); 
            let error = false;
        
            process.stderr.on('data', function(data) {
                message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
                error = true;
                fs.unlink(`./${message.author.id}.png`, (err) => {
                    if(err) console.log(err);
                });
                return;
            });
    
            process.stdout.on('end', async function() {
                if(error) return;
                let color_embed = await generate_embed('Color:', `**${args[0]}:** ${trailing_args.join(' ')}`, int);
                message.channel.send({
                    file: `./${message.author.id}.png`
                }).then(() => {
                    message.channel.send(color_embed).then(() => {
                        fs.unlink(`./${message.author.id}.png`, (err) => {
                            if(err) console.log(err);
                        });
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            });
        } else {
            let error_embed = await generate_embed('Improper command use', 'Correct usage is c!view <input> <color>\nCheck for **typos** as well');
            message.channel.send(error_embed).catch(err => console.log(err));
        }
    }

    else if(command == 'palette'){
        let palette; 
        if(args[1] == 'nature') {
            palette = nature_palettes.palettes[Math.floor(Math.random() * nature_palettes.palettes.length)];
        } else {
            palette = urban_palettes.palettes[Math.floor(Math.random() * urban_palettes.palettes.length)];
        }
        let colors = [];
        palette.map(color => {
            let hex = color_convert.rgb.hex(color.r, color.g, color.b);
            colors.push(hex);
        });

        let process = spawn(`python`, ['palette.py', palette[0].r, palette[0].g, palette[0].b, palette[1].r, palette[1].g, palette[1].b, palette[2].r, palette[2].g, palette[2].b, palette[3].r, palette[3].g, palette[3].b, palette[4].r, palette[4].g, palette[4].b, message.author.id]); 
        let error = false;
    
        process.stderr.on('data', function(data) {
            message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
            error = true;
            fs.unlink(`./${message.author.id}.png`, (err) => {
                if(err) console.log(err);
            });
            return;
        });

        process.stdout.on('end', async function() {
            if(error) return;
            let color_embed = await generate_embed('Colors (Hex):', colors.join(', '), 16777215);
            message.channel.send({
                file: `./${message.author.id}.png`
            }).then(() => {
                message.channel.send(color_embed).then(() => {
                    fs.unlink(`./${message.author.id}.png`, (err) => {
                        if(err) console.log(err);
                    });
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });
    }
});

client.on('error', err => console.log(err));

client.login(config.token);
