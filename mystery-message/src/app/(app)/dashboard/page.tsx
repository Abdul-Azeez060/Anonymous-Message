"use client";
import { useToast } from "@/hooks/use-toast";
import { acceptMessageSchema } from "@/Schema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Message } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "next-auth";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, SeparatorHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { data: session } = useSession();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { watch, setValue, register } = form;
  const acceptMessages = watch("acceptMessages");

  function handleDeleteMessage(messageId: String) {
    setMessages((messages) =>
      messages.filter((message) => message.id !== messageId)
    );
  }

  const fetchAcceptingMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      if (response.data?.isAcceptingMessages) {
        setValue("acceptMessages", response.data.isAcceptingMessages);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to fetch message",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, []);

  // dependency array ?? **********
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const responose = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(responose.data.messages || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Messages resfereshed successfully",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message || "Failed to fetch message",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  // dependency array ******************
  useEffect(() => {
    if (session?.user) {
      fetchAcceptingMessage();
      fetchMessages();
    }
  }, [session, setValue, fetchAcceptingMessage, fetchMessages]);
  // **************

  async function handleSwitchChange() {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages/", {
        isAcceptingMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to Change message",
        variant: "destructive",
      });
    }
  }
  let profileUrl = "";
  if (session?.user) {
    const { username } = session?.user as User;
    const baseUrl = `${window.location.protocol}://${window.location.hostname}`;
    profileUrl = `${baseUrl}/${username}`;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied to clipborad",
      description: "Profile url copied to clipboard",
    });
  }

  if (!session || !session.user) {
    return <div>Please login</div>;
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <SeparatorHorizontal />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              //@ts-ignore
              key={message.id}
              //@ts-ignore
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}
