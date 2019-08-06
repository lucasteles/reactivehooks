"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var enzyme_1 = __importDefault(require("enzyme"));
var enzyme_adapter_react_16_1 = __importDefault(require("enzyme-adapter-react-16"));
enzyme_1.default.configure({ adapter: new enzyme_adapter_react_16_1.default() });
