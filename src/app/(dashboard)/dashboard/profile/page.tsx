"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  AtSign,
  Plus,
  X,
  Loader2,
  Save,
  Shield,
} from "lucide-react";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Basic info
  const [fullName, setFullName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");

  // Contact info
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    isCurrent: true,
  });

  // Sensitive info
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ssn, setSsn] = useState("");

  // Usernames
  const [usernames, setUsernames] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");

  const addItem = (
    item: string,
    setItem: (value: string) => void,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    if (item && !items.includes(item)) {
      setItems([...items, item]);
      setItem("");
    }
  };

  const removeItem = (
    index: number,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addAddress = () => {
    if (newAddress.street && newAddress.city) {
      setAddresses([...addresses, newAddress]);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        isCurrent: false,
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          aliases,
          emails,
          phones,
          addresses,
          dateOfBirth,
          ssn,
          usernames,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400">
          Enter your personal information to search for data exposures
        </p>
      </div>

      {success && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20">
          <Shield className="h-4 w-4 text-emerald-500" />
          <AlertDescription className="text-emerald-400">
            Profile saved successfully. Your data is encrypted and secure.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="basic" className="data-[state=active]:bg-slate-700">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-slate-700">
            Contact
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-slate-700">
            Addresses
          </TabsTrigger>
          <TabsTrigger value="sensitive" className="data-[state=active]:bg-slate-700">
            Sensitive
          </TabsTrigger>
          <TabsTrigger value="usernames" className="data-[state=active]:bg-slate-700">
            Usernames
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-emerald-500" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your name and any aliases or previous names
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-200">
                  Full Legal Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">
                  Aliases / Previous Names
                </Label>
                <p className="text-xs text-slate-500">
                  Include maiden names, nicknames, or previous legal names
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an alias"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem(newAlias, setNewAlias, aliases, setAliases);
                      }
                    }}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem(newAlias, setNewAlias, aliases, setAliases)}
                    className="border-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {aliases.map((alias, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-md text-sm text-slate-300"
                    >
                      {alias}
                      <button
                        type="button"
                        onClick={() => removeItem(index, aliases, setAliases)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5 text-emerald-500" />
                Contact Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Add all email addresses and phone numbers associated with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emails */}
              <div className="space-y-2">
                <Label className="text-slate-200">Email Addresses</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem(newEmail, setNewEmail, emails, setEmails);
                      }
                    }}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem(newEmail, setNewEmail, emails, setEmails)}
                    className="border-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-md text-sm text-slate-300"
                    >
                      <Mail className="h-3 w-3" />
                      {email}
                      <button
                        type="button"
                        onClick={() => removeItem(index, emails, setEmails)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Phones */}
              <div className="space-y-2">
                <Label className="text-slate-200">Phone Numbers</Label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem(newPhone, setNewPhone, phones, setPhones);
                      }
                    }}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItem(newPhone, setNewPhone, phones, setPhones)}
                    className="border-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {phones.map((phone, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-md text-sm text-slate-300"
                    >
                      <Phone className="h-3 w-3" />
                      {phone}
                      <button
                        type="button"
                        onClick={() => removeItem(index, phones, setPhones)}
                        className="hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MapPin className="h-5 w-5 text-emerald-500" />
                Physical Addresses
              </CardTitle>
              <CardDescription className="text-slate-400">
                Add current and previous addresses where you&apos;ve lived
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-slate-200">Street Address</Label>
                  <Input
                    placeholder="123 Main Street"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">City</Label>
                  <Input
                    placeholder="San Francisco"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">State</Label>
                  <Input
                    placeholder="CA"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">ZIP Code</Label>
                  <Input
                    placeholder="94102"
                    value={newAddress.zipCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, zipCode: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addAddress}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </div>
              </div>

              {/* Address list */}
              <div className="space-y-2">
                {addresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white">{address.street}</p>
                      <p className="text-sm text-slate-400">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.isCurrent && (
                        <span className="text-xs text-emerald-400">
                          Current Address
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAddresses(addresses.filter((_, i) => i !== index))
                      }
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensitive Tab */}
        <TabsContent value="sensitive">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-emerald-500" />
                Sensitive Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Optional sensitive data for more thorough scanning. All data is encrypted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-slate-700/50 border-slate-600">
                <Shield className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-slate-300">
                  This information is encrypted using AES-256 encryption. SSN is hashed
                  and never stored in readable form.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-slate-200">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssn" className="text-slate-200">
                  Social Security Number (Optional)
                </Label>
                <p className="text-xs text-slate-500">
                  Used only to check dark web exposure. Stored as a one-way hash.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="ssn"
                    type="password"
                    placeholder="XXX-XX-XXXX"
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usernames Tab */}
        <TabsContent value="usernames">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AtSign className="h-5 w-5 text-emerald-500" />
                Usernames & Handles
              </CardTitle>
              <CardDescription className="text-slate-400">
                Add usernames you use across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="@username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem(newUsername, setNewUsername, usernames, setUsernames);
                    }
                  }}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    addItem(newUsername, setNewUsername, usernames, setUsernames)
                  }
                  className="border-slate-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {usernames.map((username, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-md text-sm text-slate-300"
                  >
                    <AtSign className="h-3 w-3" />
                    {username}
                    <button
                      type="button"
                      onClick={() => removeItem(index, usernames, setUsernames)}
                      className="hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
