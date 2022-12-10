"use client";

import mqtt, { MqttClient } from "mqtt";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Input } from "../components/Input";
import Editor, { Monaco } from "@monaco-editor/react";
import { EditorContentManager } from "@convergencelabs/monaco-collab-ext";

type EditorInsertOperation = {
  operation: "insert";
  index: number;
  text: string;
};

type EditorReplaceOperation = {
  operation: "replace";
  index: number;
  length: number;
  text: string;
};

type EditorDeleteOperation = {
  operation: "delete";
  index: number;
  length: number;
};

type EditorOperation =
  | EditorInsertOperation
  | EditorReplaceOperation
  | EditorDeleteOperation;

const DefaultMqttState = { mqttServer: "", mqttTopic: "" };

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [mqttState, setMqttState] = useState(DefaultMqttState);
  const clientRef = useRef<MqttClient | null>(null);
  const [editor, setEditor] = useState<ReactNode>();
  const editorContentManagerRef = useRef<EditorContentManager | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (connected) {
      setMqttState(DefaultMqttState);
    } else {
      const { mqttServer, mqttTopic } = e.target as any;
      setMqttState({
        mqttServer: mqttServer.value,
        mqttTopic: mqttTopic.value,
      });
    }
  };

  const downstream = (operation: EditorOperation) => {
    const contentManager = editorContentManagerRef.current;
    if (!contentManager) return;

    if (operation.operation === "insert")
      contentManager.insert(operation.index, operation.text);
    if (operation.operation === "replace")
      contentManager.replace(operation.index, operation.length, operation.text);
    if (operation.operation === "delete")
      contentManager.delete(operation.index, operation.length);
  };

  useEffect(() => {
    const upstream = (operation: EditorOperation) => {
      if (!clientRef.current) return;
      const operationJson = JSON.stringify(operation);
      clientRef.current.publish(mqttState.mqttTopic, operationJson);
    };

    setEditor(
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="console.log('Hey buddy :p');"
        onMount={(editor, monaco) => {
          editorContentManagerRef.current = new EditorContentManager({
            editor,
            onInsert(index, text) {
              upstream({ operation: "insert", index, text });
            },
            onReplace(index, length, text) {
              upstream({ operation: "replace", index, length, text });
            },
            onDelete(index, length) {
              upstream({ operation: "delete", index, length });
            },
          });
        }}
      />
    );
  }, [mqttState.mqttTopic]);

  useEffect(() => {
    const { mqttServer, mqttTopic } = mqttState;

    if ((mqttTopic || mqttServer) === "") {
      setConnected(false);
      return;
    }

    const client = mqtt.connect(mqttServer, {
      keepalive: 60,
      clientId: "mqttjs_" + Math.random().toString(16),
      protocolId: "MQTT",
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: "WillMsg",
        payload: "Connection Closed abnormally..!",
        qos: 0,
        retain: false,
      },
    });
    client
      .on("connect", () => {
        client.subscribe(mqttTopic);
        clientRef.current = client;
        setConnected(true);
      })
      .on("disconnect", () => setConnected(false))
      .on("message", (topic, message) => {
        downstream(JSON.parse(message.toString()));
      });

    return () => {
      if (client) {
        client.unsubscribe(mqttTopic);
        client.end();
      }
    };
  }, [mqttState]);

  useEffect(() => console.log(JSON.stringify({ connected })), [connected]);

  return (
    <>
      <form className="flex gap-4 p-3" action="" onSubmit={handleSubmit}>
        <Input name="mqttServer" placeholder="MQTT Server" />
        <Input name="mqttTopic" placeholder="MQTT Topic" />
        <button
          type="submit"
          className="rounded px-2 bg-purple-500 text-white accent-purple-500 hover:bg-purple-400 text-sm"
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </form>
      <div>{editor}</div>
    </>
  );
}
