const groupHandler = async (bot, Scenes, enter, leave, Markup, Group) => {
    bot.on("my_chat_member", (ctx, next) => {
        console.log(ctx.update.my_chat_member.new_chat_member.status)
        if (ctx.update.my_chat_member.new_chat_member.status == "administrator") {
            // console.log(ctx.update.my_chat_member)

            

            // console.log(ctx.update.my_chat_member.chat.id)
            var chatId = ctx.update.my_chat_member.chat.id

            
            // console.log(ctx.update.my_chat_member.chat.title)
            var chatName = ctx.update.my_chat_member.chat.title

            // console.log(ctx.update.my_chat_member.chat.username)
            var chatUsername = ctx.update.my_chat_member.chat.username

            // console.log(ctx.update.my_chat_member.chat.type)
            var theChatType = ctx.update.my_chat_member.chat.type === 'channel' ? 'channel' : 'group';


            // console.log(ctx.update.my_chat_member.from.id)
            var adminChatId = ctx.update.my_chat_member.from.id

            // console.log(ctx.update.my_chat_member.from.first_name)
            var adminFirst_name = ctx.update.my_chat_member.from.first_name

            var adminUsername = ctx.update.my_chat_member.from.username


            Group.findOne({chatId}).then(existingGroup => {
                if (!existingGroup) {
                    const group = new Group({
                        chatId,
                        chatName,
                        chatUsername,
                        theChatType,
                        adminChatId,
                        adminFirst_name,
                        adminUsername,
                        createdAt: new Date()
                    });

                    group.save().then(res => console.log('✅ Group saved:', res))
                        .catch(err => console.error('❌ Save error:', err));
                } else {
                    console.log('ℹ️ Group already exists.');
                }
            });


        } else {
            next(ctx)
        }

    })
}

module.exports = {
    groupHandler
}