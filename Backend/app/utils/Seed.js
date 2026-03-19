const User = require('../Models/UsersModel');
const SeedAiUser = async () => {
    const existingAI = await User.findOne({ email: 'ai@system.com' });
    if (!existingAI) {
        await User.create({
            name: "AI",
            email: "ai@system.com",
            isAI: true,
        });
        console.log("AI User Created!");
    } else {
        console.log("AI Already Created!");
    }
}
module.exports = SeedAiUser;