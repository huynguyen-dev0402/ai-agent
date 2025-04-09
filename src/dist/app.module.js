"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var app_controller_1 = require("./app.controller");
var app_service_1 = require("./app.service");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var users_module_1 = require("./modules/users/users.module");
var auth_module_1 = require("./modules/auth/auth.module");
var user_entity_1 = require("./modules/users/entities/user.entity");
var chatbots_module_1 = require("./modules/chatbots/chatbots.module");
var chatbot_entity_1 = require("./modules/chatbots/entities/chatbot.entity");
var chatbot_models_module_1 = require("./modules/chatbot-models/chatbot-models.module");
var chatbot_knowledge_module_1 = require("./modules/chatbot-knowledge/chatbot-knowledge.module");
var api_tokens_module_1 = require("./modules/api-tokens/api-tokens.module");
var api_token_entity_1 = require("./modules/api-tokens/entities/api-token.entity");
var chatbot_model_entity_1 = require("./modules/chatbot-models/entities/chatbot-model.entity");
var chatbot_configs_module_1 = require("./modules/chatbot-configs/chatbot-configs.module");
var chatbot_onboarding_module_1 = require("./modules/chatbot-onboarding/chatbot-onboarding.module");
var onboarding_suggested_questions_module_1 = require("./modules/onboarding-suggested-questions/onboarding-suggested-questions.module");
var chatbot_onboarding_entity_1 = require("./modules/chatbot-onboarding/entities/chatbot-onboarding.entity");
var onboarding_suggested_question_entity_1 = require("./modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity");
var chatbot_config_entity_1 = require("./modules/chatbot-configs/entities/chatbot-config.entity");
var workspaces_module_1 = require("./modules/workspaces/workspaces.module");
var chatbot_published_module_1 = require("./modules/chatbot_published/chatbot_published.module");
var workspace_entity_1 = require("./modules/workspaces/entities/workspace.entity");
var chatbot_published_entity_1 = require("./modules/chatbot_published/entities/chatbot_published.entity");
var resources_module_1 = require("./modules/resources/resources.module");
var resource_entity_1 = require("./modules/resources/entities/resource.entity");
var upload_module_1 = require("./modules/upload/upload.module");
var documents_module_1 = require("./modules/documents/documents.module");
var document_entity_1 = require("./modules/documents/entities/document.entity");
var chatbot_prompt_module_1 = require("./modules/chatbot-prompt/chatbot-prompt.module");
var chatbot_prompt_entity_1 = require("./modules/chatbot-prompt/entities/chatbot-prompt.entity");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        common_1.Module({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true
                }),
                typeorm_1.TypeOrmModule.forRoot({
                    type: 'mysql',
                    host: process.env.DATABASE_HOST,
                    port: Number(process.env.DATABASE_PORT),
                    username: process.env.DATABASE_USERNAME,
                    password: process.env.DATABASE_PASSWORD,
                    database: process.env.DATABASE_NAME,
                    entities: [
                        user_entity_1.User,
                        chatbot_entity_1.Chatbot,
                        api_token_entity_1.ApiToken,
                        workspace_entity_1.Workspace,
                        resource_entity_1.Resource,
                        document_entity_1.Document,
                        chatbot_published_entity_1.ChatbotPublished,
                        chatbot_model_entity_1.ChatbotModel,
                        chatbot_config_entity_1.ChatbotConfig,
                        chatbot_prompt_entity_1.ChatbotPrompt,
                        chatbot_onboarding_entity_1.ChatbotOnboarding,
                        onboarding_suggested_question_entity_1.OnboardingSuggestedQuestion,
                    ]
                }),
                users_module_1.UsersModule,
                auth_module_1.AuthModule,
                chatbots_module_1.ChatbotsModule,
                chatbot_models_module_1.ChatbotModelsModule,
                chatbot_knowledge_module_1.ChatbotKnowledgeModule,
                api_tokens_module_1.ApiTokensModule,
                chatbot_configs_module_1.ChatbotConfigsModule,
                chatbot_onboarding_module_1.ChatbotOnboardingModule,
                onboarding_suggested_questions_module_1.OnboardingSuggestedQuestionsModule,
                workspaces_module_1.WorkspacesModule,
                chatbot_published_module_1.ChatbotPublishedModule,
                resources_module_1.ResourcesModule,
                upload_module_1.UploadModule,
                documents_module_1.DocumentsModule,
                chatbot_prompt_module_1.ChatbotPromptModule,
            ],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
