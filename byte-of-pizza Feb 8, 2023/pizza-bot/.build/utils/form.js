"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var form_exports = {};
__export(form_exports, {
  messageForm: () => messageForm
});
module.exports = __toCommonJS(form_exports);
const messageForm = [
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "\u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0438\u0446\u0446\u0443",
      "emoji": true
    }
  },
  {
    "type": "section",
    "block_id": "pizza_name",
    "text": {
      "type": "mrkdwn",
      "text": "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0438\u0446\u0446\u044B"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "\u0412\u044B\u0431\u0435\u0440\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "\u0410\u043D\u0430\u043D\u0430\u0441\u043E\u0432\u0430\u044F",
            "emoji": true
          },
          "value": "pinapple"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0421\u044B\u0440\u043D\u0430\u044F",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0421\u0438\u0446\u0438\u043B\u0438\u0439\u0441\u043A\u0430\u044F",
            "emoji": true
          },
          "value": "sicilian"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0427\u0435\u0442\u044B\u0440\u0435 \u0441\u0435\u0437\u043E\u043D\u0430",
            "emoji": true
          },
          "value": "4seasons"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041F\u0435\u043F\u043F\u0435\u0440\u043E\u043D\u0438",
            "emoji": true
          },
          "value": "peperoni"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0422\u0440\u0438\u043A\u043E\u043B\u043E\u0440",
            "emoji": true
          },
          "value": "tricolor"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041E\u0432\u043E\u0449\u043D\u0430\u044F",
            "emoji": true
          },
          "value": "vegetable"
        }
      ],
      "action_id": "pizza_option"
    }
  },
  {
    "type": "section",
    "block_id": "pizza_size",
    "text": {
      "type": "mrkdwn",
      "text": "*\u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u0438\u0446\u0446\u0438*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "\u0412\u044B\u0431\u0435\u0440\u0438 \u0440\u0430\u0437\u043C\u0435\u0440",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "\u0411\u043E\u043B\u044C\u0448\u0430\u044F",
            "emoji": true
          },
          "value": "big"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0421\u0440\u0435\u0434\u043D\u044F\u044F",
            "emoji": true
          },
          "value": "medium"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0430\u044F",
            "emoji": true
          },
          "value": "small"
        }
      ],
      "action_id": "pizza_option"
    }
  },
  {
    "type": "section",
    "block_id": "pizza_dough",
    "text": {
      "type": "mrkdwn",
      "text": "*\u0422\u0435\u0441\u0442\u043E*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "\u0412\u044B\u0431\u0435\u0440\u0438 \u0432\u0438\u0434 \u0442\u0435\u0441\u0442\u0430",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "\u041E\u0431\u044B\u0447\u043D\u043E\u0435",
            "emoji": true
          },
          "value": "normal"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0422\u043E\u043D\u043A\u043E\u0435",
            "emoji": true
          },
          "value": "thin"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0414\u0440\u043E\u0436\u0436\u0435\u0432\u043E\u0435",
            "emoji": true
          },
          "value": "east"
        }
      ],
      "action_id": "pizza_option"
    }
  },
  {
    "type": "section",
    "block_id": "pizza_border",
    "text": {
      "type": "mrkdwn",
      "text": "\u0411\u043E\u0440\u0442\u0438\u043A"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "\u0412\u044B\u0431\u0435\u0440\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "\u041E\u0431\u044B\u0447\u043D\u044B\u0439",
            "emoji": true
          },
          "value": "normal"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0421\u044B\u0440\u043D\u044B\u0439",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u043A\u043E\u043B\u0431\u0430\u0441\u043D\u044B\u0439",
            "emoji": true
          },
          "value": "sausage"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0412\u043A\u0443\u0441\u043D\u044B\u0439 )",
            "emoji": true
          },
          "value": "tasty"
        }
      ],
      "action_id": "pizza_option"
    }
  },
  {
    "type": "section",
    "block_id": "pizza_additive",
    "text": {
      "type": "mrkdwn",
      "text": "*\u0414\u043E\u0431\u0430\u0432\u043A\u0438*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "\u0427\u0435\u0433\u043E \u0434\u043E\u0431\u0430\u0432\u0442\u044C \u043F\u043E\u0431\u043E\u043B\u044C\u0448\u0435?",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "\u0421\u044B\u0440\u0430",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u0417\u0435\u043B\u0435\u043D\u0438",
            "emoji": true
          },
          "value": "green"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041C\u044F\u0441\u0430",
            "emoji": true
          },
          "value": "meat"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041E\u043B\u0438\u0432\u043E\u043A",
            "emoji": true
          },
          "value": "oliv"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041F\u0440\u0435\u0447\u0438\u043A\u0430",
            "emoji": true
          },
          "value": "peper"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "\u041F\u043E\u043C\u0438\u0434\u043E\u0440\u043E\u0432",
            "emoji": true
          },
          "value": "tomat"
        }
      ],
      "action_id": "pizza_option"
    }
  },
  {
    "type": "input",
    "block_id": "pizza_address",
    "element": {
      "type": "plain_text_input",
      "action_id": "pizza_option"
    },
    "label": {
      "type": "plain_text",
      "text": "\u0410\u0434\u0440\u0435\u0441",
      "emoji": true
    }
  },
  {
    "type": "input",
    "block_id": "pizza_comment",
    "element": {
      "type": "plain_text_input",
      "multiline": true,
      "action_id": "pizza_option"
    },
    "label": {
      "type": "plain_text",
      "text": "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443",
      "emoji": true
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*\u041D\u0443 \u0447\u0442\u043E, \u0437\u0430\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C?*"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "\u0414\u0430!",
        "emoji": true
      },
      "value": "click_me_123",
      "action_id": "pizza_order-action"
    }
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  messageForm
});
//# sourceMappingURL=form.js.map
