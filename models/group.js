const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');


const groupSchema = new mongoose.Schema({
  chatId: { type: String, required: true},

  chatName: {
    type: String,
    required: true,
  },

  chatUsername: {
    type: String,
    required: false,
  },

  theChatType: {
    type: String,
    required: true,
  },

  // إعدادات الأذكار
  adhkarMorningEnabled: { type: Boolean, default: false },
  adhkarMorningTime: { type: String, default: null }, // "05:00" to "12:00"

  adhkarEveningEnabled: { type: Boolean, default: false },
  adhkarEveningTime: { type: String, default: null }, // "16:00" to "22:00"
  
  quranTimes: {
    morning: { type: String, default: "6:00" }, // مثل "06:00"
    evening: { type: String, default: "18:00" }  // مثل "17:30"
  },

  quranCurrentPage: { type: Number, default: 1 }, // يتقدّم مع كل إرسال

  // بيانات إضافية مستقبلية
  adminChatId: { type: String }, // معرّف صاحب البوت في القروب، مفيد إن كنت تربط مع مستخدم
  adminFirst_name: {
    type: String,
    required: true,
  },
  adminUsername: {
    type: String,
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Group", groupSchema);