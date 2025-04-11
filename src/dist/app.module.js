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
var chatbots_module_1 = require("./modules/chatbots/chatbots.module");
var chatbot_models_module_1 = require("./modules/chatbot-models/chatbot-models.module");
var chatbot_knowledge_module_1 = require("./modules/chatbot-knowledge/chatbot-knowledge.module");
var api_tokens_module_1 = require("./modules/api-tokens/api-tokens.module");
var chatbot_configs_module_1 = require("./modules/chatbot-configs/chatbot-configs.module");
var chatbot_onboarding_module_1 = require("./modules/chatbot-onboarding/chatbot-onboarding.module");
var onboarding_suggested_questions_module_1 = require("./modules/onboarding-suggested-questions/onboarding-suggested-questions.module");
var workspaces_module_1 = require("./modules/workspaces/workspaces.module");
var chatbot_published_module_1 = require("./modules/chatbot_published/chatbot_published.module");
var resources_module_1 = require("./modules/resources/resources.module");
var upload_module_1 = require("./modules/upload/upload.module");
var documents_module_1 = require("./modules/documents/documents.module");
var chatbot_prompt_module_1 = require("./modules/chatbot-prompt/chatbot-prompt.module");
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
                    entities: [__dirname + '/**/*.entity{.ts,.js}']
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
