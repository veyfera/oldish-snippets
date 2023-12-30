export const messageForm = [
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "Заказать пиццу",
      "emoji": true
    }
  },
  {
    "type": "section",
    "block_id": "pizza_name",
    "text": {
      "type": "mrkdwn",
      "text": "Название пиццы"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Выбери вариант",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "Ананасовая",
            "emoji": true
          },
          "value": "pinapple"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Сырная",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Сицилийская",
            "emoji": true
          },
          "value": "sicilian"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Четыре сезона",
            "emoji": true
          },
          "value": "4seasons"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Пепперони",
            "emoji": true
          },
          "value": "peperoni"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Триколор",
            "emoji": true
          },
          "value": "tricolor"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Овощная",
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
      "text": "*Размер пицци*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Выбери размер",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "Большая",
            "emoji": true
          },
          "value": "big"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Средняя",
            "emoji": true
          },
          "value": "medium"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Маленькая",
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
      "text": "*Тесто*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Выбери вид теста",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "Обычное",
            "emoji": true
          },
          "value": "normal"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Тонкое",
            "emoji": true
          },
          "value": "thin"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Дрожжевое",
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
      "text": "Бортик"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Выбери вариант",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "Обычный",
            "emoji": true
          },
          "value": "normal"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Сырный",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "колбасный",
            "emoji": true
          },
          "value": "sausage"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Вкусный )",
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
      "text": "*Добавки*"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "text": "Чего добавть побольше?",
        "emoji": true
      },
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "Сыра",
            "emoji": true
          },
          "value": "cheese"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Зелени",
            "emoji": true
          },
          "value": "green"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Мяса",
            "emoji": true
          },
          "value": "meat"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Оливок",
            "emoji": true
          },
          "value": "oliv"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Пречика",
            "emoji": true
          },
          "value": "peper"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "Помидоров",
            "emoji": true
          },
          "value": "tomat"
        },
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
      "text": "Адрес",
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
      "text": "Коментарий к заказу",
      "emoji": true
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Ну что, заказываем?*"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "Да!",
        "emoji": true
      },
      "value": "click_me_123",
      "action_id": "pizza_order-action"
    }
  }
];
