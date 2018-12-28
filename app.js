const Discord = require("discord.js");
const client = new Discord.Client();

const { spawn } = require('child_process');
const fs = require('fs');
const getColors = require('get-image-colors')
const request = require('request').defaults({ encoding: null });
const fileType = require('file-type');

const config = require("./config.json");
const generate_embed = require("./generate_simple_embed.js");
const converter = require('./color_converter/main.js');
const convert = new converter();
const adobe_palettes = require('./palettes.json');


client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(` with Colors`);
});

const color_types = ['hex', 'rgb', 'int', 'hsl', 'hsv', 'cmyk', 'pantone'];
let user_cooldowns = new Map();

client.on("message", async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    
    const args = message.content.slice(config.prefix.length).replace(/\\n/g, '').trim().toLowerCase().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(user_cooldowns.has(message.author.id)){
        if(command == 'random' || command == 'palette' || command == 'random' || command == 'genpalette' || command == 'generatepalette'){
            if(new Date().getTime() - user_cooldowns.get(message.author.id) > 2000){
                user_cooldowns.set(message.author.id, new Date().getTime())
            } else {
                let error_embed = await generate_embed('You are on cooldown', 'Color-view commands have a 2 second cooldown');
                message.channel.send(error_embed).catch(err => console.log(err));
                return;
            }
        } else {
            if(new Date().getTime() - user_cooldowns.get(message.author.id) > 1000){
                user_cooldowns.set(message.author.id, new Date().getTime())
            } else {
                let error_embed = await generate_embed('You are on cooldown', 'No color-view commands have a 1 second cooldown');
                message.channel.send(error_embed).catch(err => console.log(err));
                return;
            }
        }
    } else {
        user_cooldowns.set(message.author.id, new Date().getTime());
    }

    if(command == 'help'){
        let fields = [
            {
                'name': 'c!palette <format>',
                'value': 
                    '  * Generates pseudo-random palette\n' +
                    '  - <format> color format of palette\n' +
                    '  > c!palette hex'
            },
            {
                'name': 'c!genpalette <link>',
                'value': 
                    '  * Generates palette from image\n' +
                    '  - <link> Valid image link\n' +
                    '  > c!genpalette https://annsflowersyoakum.com/wp-content/uploads/interior1.jpg'
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
                'name': 'c!view <format> <color>',
                'value': 
                    '  * Displays square of inputted color\n' +
                    '  - <format> is the color format of the input color (i.e. hex, rgb)\n' +
                    '  - <color> is the your color in <input> format\n' +
                    '  > c!view rgb 111 122 223'
            },
            {
                'name': 'c!random <format>',
                'value': 
                    '  * Displays random color of input format\n' +
                    '  - <format> is the desired color format\n' +
                    '  > c!random hex'
            },
            {
                'name': 'c!formathelp',
                'value': '  - View specific formatting for each color format'
            },
            {
                'name': 'Supported color types:',
                'value': '  - hex, rgb, int, hsl, hsv, cmyk'
            }
        ]
        let embed = {
            embed: {
                "url": "https://discordapp.com",
                "color": Math.floor(Math.random() * 16777215),
                "timestamp": "2018-12-23T05:19:10.633Z",
                "footer": {
                    "text": "Color.io | @The3DSquare"
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
                    '  - All are in range from 0 to 255 (integers)\n' +
                    '  > c!view rgb 100 150 200'
            },
            {
                'name': 'hex',
                'value': 
                    '  - <Hex Number>\n' +
                    '  - Must be only 6 digits long \n' +
                    '  > c!view hex 12ab89'
            },
            {
                'name': 'int',
                'value': 
                    '  - <Integer>\n' +
                    '  - Must be equal or less than 16777215 \n' +
                    '  > c!view int 20480'
            },
            {
                'name': 'cmyk',
                'value': 
                    '  - <Cyan> <Magenta> <Yellow> <Key(Black)>\n' +
                    '  - All are in range from 0 to 1 (decimals)\n' +
                    '  > c!view cmyk 0.2 0.4 0.6 0.8'
            },
            {
                'name': 'hsl',
                'value': 
                    '  - <Hue> <Saturation> <Level>\n' +
                    '  - <Hue> range from 0 to 360, <Saturation> and <Level> range from 0 to 100\n' +
                    '  > c!view hsl 100 100 100'
            },
            {
                'name': 'hsv',
                'value': 
                    '  - <Hue> <Saturation> <Value>\n' +
                    '  - <Hue> range from 0 to 360, <Saturation> and <Value> range from 0 to 100\n' +
                    '  > c!view hsv 100 100 100'
            },
        ]
        let embed = {
            embed: {
                "url": "https://discordapp.com",
                "color": Math.floor(Math.random() * 16777215),
                "timestamp": "2018-12-23T05:19:10.633Z",
                "footer": {
                    "text": "Color.io | @The3DSquare"
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
            let input = args.slice(2);
            if(input.length == 1) input = input[0];
            let result;
            try {
                result = convert[`${args[0]}_2_${args[1]}`](input);
            } catch(e){
                let error_embed = await generate_embed('Invalid Format', 'Consult \`c!formathelp\` for more info');
                message.channel.send(error_embed);
                return;
            }
            
            if(Array.isArray(result)) result = result.join(' ').replace(/\\n/g, '');

            if(result == null) {
                let error_embed = await generate_embed('Invalid Format', 'Consult \`c!formathelp\` for more info');
                message.channel.send(error_embed);
                return;
            } else {
                result = result.toLowerCase();

                let display_color = convert[`${args[0]}_2_int`](input);
                if(display_color > 16777215){
                    let error_embed = await generate_embed('Invalid Format', 'Consult \`c!formathelp\` for more info');
                    message.channel.send(error_embed);
                    return;
                } else {
                    let embed = await generate_embed(`Converted ${args[0].toLowerCase()} to ${args[1].toLowerCase()}`, `(${args.slice(2).join(', ')}) converted to **(${result})**`, display_color);
                    message.channel.send(embed);
                }
            }
        } else {
            let error_embed = await generate_embed('Improper command use', 'Correct usage is c!convert <input> <desired output> <color>\nCheck for **typos** as well');
            message.channel.send(error_embed).catch(err => console.log(err));
        }
    }

    else if(command == 'view'){
        if(color_types.includes(args[0])){
            
            let trailing_args = args.slice(1);
            if(trailing_args.length == 1) trailing_args = trailing_args[0];
            let rgb, display_color;
            try {
                rgb = convert[`${args[0]}_2_rgb`](trailing_args);
                display_color = convert[`rgb_2_int`](rgb);
            } catch (e) {
                let error_embed = await generate_embed('Invalid Format', 'Consult \`c!formathelp\` for more info');
                message.channel.send(error_embed);
                return;
            }

            if(rgb == null || display_color == null){
                let error_embed = await generate_embed('Invalid Format', 'Consult \`c!formathelp\` for more info');
                message.channel.send(error_embed);
                return;
            }

            let process = spawn(`python`, ['color.py', rgb[0], rgb[1], rgb[2], message.author.id]); 
            let error = false;
        
            process.stderr.on('data', function(data) {
                message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
                error = true;
                fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                    if(err) console.log(err);
                });
                return;
            });
    
            process.stdout.on('end', async function() {
                if(error) return;
                let joined_trailing_args = trailing_args;
                if(Array.isArray(trailing_args)) joined_trailing_args = trailing_args.join(' ');

                let color_embed = await generate_embed('Color:', `${args[0]}: **(${joined_trailing_args})**`, display_color);
                message.channel.send({
                    file: `./temp/${message.author.id}.png`
                }).then(() => {
                    message.channel.send(color_embed).then(() => {
                        fs.unlink(`./temp/${message.author.id}.png`, (err) => {
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
        let hex_palette = adobe_palettes.colors[Math.round(Math.random() * adobe_palettes.colors.length)], valid = false;
        if(color_types.includes(args[0])) valid = true;

        if(valid){
            let colors = [], palette = [];
            hex_palette.map(color => {
                let format = convert[`hex_2_${args[0]}`](color);
                if(Array.isArray(format)){
                    format = `(${format.join(' ')})`;
                } else {
                    format = `${format}`;
                }
                let rgb_vals = convert.hex_2_rgb(color);
                palette.push({
                    r: rgb_vals[0],
                    g: rgb_vals[1],
                    b: rgb_vals[2]
                });
                if(Array.isArray(format)) format = `(${format.join(' ')})`;
                colors.push(format);
            });
            
            let process = spawn(`python`, ['palette.py', palette[0].r, palette[0].g, palette[0].b, palette[1].r, palette[1].g, palette[1].b, palette[2].r, palette[2].g, palette[2].b, palette[3].r, palette[3].g, palette[3].b, palette[4].r, palette[4].g, palette[4].b, palette[5].r, palette[5].g, palette[5].b, message.author.id]); 
            let error = false;
        
            process.stderr.on('data', function(data) {
                message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
                error = true;
                fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                    if(err) console.log(err);
                });
                return;
            });

            process.stdout.on('end', async function() {
                if(error) return;
                let color_embed = await generate_embed(`Colors (${args[0]}):`, colors.join(', '));
                message.channel.send({
                    file: `./temp/${message.author.id}.png`
                }).then(() => {
                    message.channel.send(color_embed).then(() => {
                        fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                            if(err) console.log(err);
                        });
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            });
        } else {
            let error_embed = await generate_embed('Invalid Format', 'Check c!help for list of color formats\nCheck for **typos** as well');
            message.channel.send(error_embed).catch(err => console.log(err));
        }
    }

    else if(command == 'random'){
        if(color_types.includes(args[0])){
            
            let int = Math.floor(Math.random() * 16777215);
            let color = convert[`int_2_${args[0]}`](int);
            let rgb = convert['int_2_rgb'](int);

            let process = spawn(`python`, ['color.py', rgb[0], rgb[1], rgb[2], message.author.id]); 
            let error = false;
        
            process.stderr.on('data', function(data) {
                message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
                error = true;
                fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                    if(err) console.log(err);
                });
                return;
            });
    
            process.stdout.on('end', async function() {
                if(error) return;
                let joined_color_args = color;
                if(Array.isArray(color)) joined_color_args = color.join(' ');

                let color_embed = await generate_embed('Random Color:', `${args[0]}: **(${joined_color_args})**`, int);
                message.channel.send({
                    file: `./temp/${message.author.id}.png`
                }).then(() => {
                    message.channel.send(color_embed).then(() => {
                        fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                            if(err) console.log(err);
                        });
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            });
        } else {
            let error_embed = await generate_embed('Improper command use', 'Correct usage is c!random <input>\nCheck for **typos** as well');
            message.channel.send(error_embed).catch(err => console.log(err));
        }
    }

    else if(command == 'genpalette' || command == 'generatepalette'){
        let fetching_embed = await generate_embed('Fetching Image', 'Please wait...');
        message.channel.send(fetching_embed).catch(err => console.log(err));

        request.get(args[0], async function (err, res, body) {
            if(err){
                let error_embed = await generate_embed('Internal error', 'Try again later');
                message.channel.send(error_embed).catch(err => console.log(err));
                return;
            }
            let file_mime_raw = fileType(body), file_mime;
            if(file_mime_raw != null) {
                file_mime = file_mime_raw.mime;
            } else {
                let error_embed = await generate_embed('Invalid Image Link', 'Make sure your link is an image link');
                message.channel.send(error_embed).catch(err => console.log(err));
                return;
            }

            if(file_mime != false){
                getColors(body, file_mime).then(colors => {
                    let palette = []
                    colors.forEach(color => {
                        let values = color._rgb.slice(0, 3);
                        palette.push({
                            r: values[0],
                            g: values[1],
                            b: values[2],
                        });
                    });

                    let process = spawn(`python`, ['palette_5.py', palette[0].r, palette[0].g, palette[0].b, palette[1].r, palette[1].g, palette[1].b, palette[2].r, palette[2].g, palette[2].b, palette[3].r, palette[3].g, palette[3].b, palette[4].r, palette[4].g, palette[4].b, message.author.id]); 
                    let error = false;
                
                    process.stderr.on('data', function(data) {
                        message.channel.send(`\`\`\`Error:\n${data.toString()}\`\`\``);
                        error = true;
                        fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                            if(err) console.log(err);
                        });
                        return;
                    });
        
                    process.stdout.on('end', async function() {
                        if(error) return;
                        let color_embed = await generate_embed(`Colors from ${args[0]}:`, 'Hex: ' + colors.join(', ').toUpperCase().replace(/#/ig, ''));
                        message.channel.send({
                            file: `./temp/${message.author.id}.png`
                        }).then(() => {
                            message.channel.send(color_embed).then(() => {
                                fs.unlink(`./temp/${message.author.id}.png`, (err) => {
                                    if(err) console.log(err);
                                });
                            }).catch(err => console.log(err));
                        }).catch(err => console.log(err));
                    });
                }).catch(async err => {
                    let error_embed = await generate_embed('Internal Error', 'Make sure your link is an image link and try again later\nNote this feature is experimental and not all images work');
                    message.channel.send(error_embed).catch(err => console.log(err));
                });
            } else {
                let error_embed = await generate_embed('Invalid Image Link', 'Make sure your link is an image link');
                message.channel.send(error_embed).catch(err => console.log(err));
            }
        });
    }
});

client.on('error', err => console.log(err));

client.login(config.token);
