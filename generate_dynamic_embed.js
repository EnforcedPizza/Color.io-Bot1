module.exports = async function generate_dynamic_embed(values, color = 45698){
    return new Promise((resolve, reject) => {
        let fields = [];
        values.forEach((field) => {
            fields.push({
                "name": field[0],
                "value": field[1]
            });
        });
        resolve({
                embed: {
                    "url": "https://discordapp.com",
                    "color": color,
                    "timestamp": "2018-12-23T05:19:10.633Z",
                    "footer": {
                        "text": "League of RPG Bot | @CallMehMiles"
                    },
                    "fields": fields
                }
            }
        );
    });
}
