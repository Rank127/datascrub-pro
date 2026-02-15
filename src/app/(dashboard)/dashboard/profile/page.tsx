"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
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
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { trackProfileCompleted } from "@/components/analytics/google-analytics";
import { PageHeader } from "@/components/dashboard/page-header";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isCurrent: boolean;
}

interface CompletionStatus {
  basic: boolean;
  contact: boolean;
  addresses: boolean;
  sensitive: boolean;
  usernames: boolean;
  count: number;
  percentage: number;
}

function getProgressColor(count: number): {
  bar: string;
  text: string;
} {
  if (count >= 5) return { bar: "bg-emerald-500", text: "text-emerald-400" };
  if (count >= 3) return { bar: "bg-blue-500", text: "text-blue-400" };
  return { bar: "bg-amber-500", text: "text-amber-400" };
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
  const [hasExistingSSN, setHasExistingSSN] = useState(false);

  // Usernames
  const [usernames, setUsernames] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");

  // Compute completion status
  const completion = useMemo<CompletionStatus>(() => {
    const basic = fullName.trim().length > 0;
    const contact = emails.length > 0 || phones.length > 0;
    const addr = addresses.length > 0;
    const sensitive = dateOfBirth.trim().length > 0;
    const unames = usernames.length > 0;
    const count = [basic, contact, addr, sensitive, unames].filter(Boolean).length;
    return {
      basic,
      contact,
      addresses: addr,
      sensitive,
      usernames: unames,
      count,
      percentage: Math.round((count / 5) * 100),
    };
  }, [fullName, emails, phones, addresses, dateOfBirth, usernames]);

  // Load existing profile data on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setFullName(data.profile.fullName || "");
            setAliases(data.profile.aliases || []);
            setEmails(data.profile.emails || []);
            setPhones(data.profile.phones || []);
            setAddresses(data.profile.addresses || []);
            setDateOfBirth(data.profile.dateOfBirth || "");
            setHasExistingSSN(data.profile.hasSSN || false);
            setUsernames(data.profile.usernames || []);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

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

  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    // Auto-add any pending items from input fields
    const finalEmails = newEmail && !emails.includes(newEmail) ? [...emails, newEmail] : emails;
    const finalPhones = newPhone && !phones.includes(newPhone) ? [...phones, newPhone] : phones;
    const finalAliases = newAlias && !aliases.includes(newAlias) ? [...aliases, newAlias] : aliases;
    const finalUsernames = newUsername && !usernames.includes(newUsername) ? [...usernames, newUsername] : usernames;

    // Update state with any auto-added items
    if (finalEmails !== emails) { setEmails(finalEmails); setNewEmail(""); }
    if (finalPhones !== phones) { setPhones(finalPhones); setNewPhone(""); }
    if (finalAliases !== aliases) { setAliases(finalAliases); setNewAlias(""); }
    if (finalUsernames !== usernames) { setUsernames(finalUsernames); setNewUsername(""); }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          aliases: finalAliases,
          emails: finalEmails,
          phones: finalPhones,
          addresses,
          dateOfBirth,
          ssn,
          usernames: finalUsernames,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Track profile completion
        trackProfileCompleted();
        setSuccess(true);
        setSsn(""); // Clear SSN field after save (it's hashed, can't be retrieved)
        setHasExistingSSN(!!ssn || hasExistingSSN); // Update SSN indicator
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to save profile");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Network error - please try again");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const progressColor = getProgressColor(completion.count);

  // Badge helpers
  const contactBadgeText = (() => {
    const parts: string[] = [];
    if (emails.length > 0) parts.push(`${emails.length} email${emails.length > 1 ? "s" : ""}`);
    if (phones.length > 0) parts.push(`${phones.length} phone${phones.length > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "No info added";
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Enter your personal information to search for data exposures"
      />

      {/* Profile Completion Progress */}
      {!isLoadingProfile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              Profile Completion: <span className={progressColor.text}>{completion.count} of 5</span> sections complete
            </span>
            <span className={progressColor.text}>{completion.percentage}%</span>
          </div>
          <Progress
            value={completion.percentage}
            className="h-2 bg-slate-700"
            indicatorClassName={`${progressColor.bar} transition-all duration-500`}
          />
        </div>
      )}

      {/* Motivational Banner */}
      {!isLoadingProfile && completion.percentage < 100 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-3">
              <h3 className="text-white font-medium">Complete your profile for the best scan results</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-emerald-400 shrink-0">&#x2022;</span>
                  Data brokers list you under different names, emails, and addresses &mdash; the more we know, the more we find and remove.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 shrink-0">&#x2022;</span>
                  A complete profile means one thorough scan catches everything. No need to scan multiple times.
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 shrink-0">&#x2022;</span>
                  All your data is encrypted with AES-256. We never share your information.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {success && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20">
          <Shield className="h-4 w-4 text-emerald-500" />
          <AlertDescription className="text-emerald-400">
            Profile saved successfully. Your data is encrypted and secure.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <Shield className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isLoadingProfile ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="ml-2 text-slate-400">Loading profile...</span>
        </div>
      ) : (
      <>
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="basic" className="data-[state=active]:bg-emerald-500/30 data-[state=active]:text-emerald-300 gap-1.5">
            {completion.basic ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-300 gap-1.5">
            {completion.contact ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
            Contact
          </TabsTrigger>
          <TabsTrigger value="addresses" className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-300 gap-1.5">
            {completion.addresses ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
            Addresses
          </TabsTrigger>
          <TabsTrigger value="sensitive" className="data-[state=active]:bg-amber-500/30 data-[state=active]:text-amber-300 gap-1.5">
            {completion.sensitive ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
            Sensitive
          </TabsTrigger>
          <TabsTrigger value="usernames" className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-300 gap-1.5">
            {completion.usernames ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
            Usernames
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5 text-emerald-500" />
                  Basic Information
                </CardTitle>
                {fullName.trim() ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Name set
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    Not set
                  </span>
                )}
              </div>
              <CardDescription className="text-slate-400">
                Data brokers list you under different name variations. Adding aliases helps us find and remove more records.
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
                  Include maiden names, nicknames, or previous legal names. Click + or press Enter to add.
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Contact Information
                </CardTitle>
                {completion.contact ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {contactBadgeText}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    No info added
                  </span>
                )}
              </div>
              <CardDescription className="text-slate-400">
                Brokers link profiles by email and phone. Adding all of yours helps us match and remove every listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emails */}
              <div className="space-y-2">
                <Label className="text-slate-200">Email Addresses</Label>
                <p className="text-xs text-slate-500">Type an email and click + or press Enter to add it</p>
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
                <p className="text-xs text-slate-500">Type a phone number and click + or press Enter to add it</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  Physical Addresses
                </CardTitle>
                {addresses.length > 0 ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {addresses.length} address{addresses.length > 1 ? "es" : ""}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    No addresses
                  </span>
                )}
              </div>
              <CardDescription className="text-slate-400">
                People-search sites index your address history. Including past addresses helps us catch older records.
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-amber-500" />
                  Sensitive Information
                </CardTitle>
                <div className="flex gap-1.5">
                  {dateOfBirth.trim() ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      DOB set
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                      DOB not set
                    </span>
                  )}
                  {hasExistingSSN && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      SSN on file
                    </span>
                  )}
                </div>
              </div>
              <CardDescription className="text-slate-400">
                Date of birth helps us accurately match your records and avoid false positives. SSN is checked for dark web exposure only. All data is AES-256 encrypted.
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
                {hasExistingSSN && (
                  <p className="text-xs text-emerald-400">
                    SSN already on file. Enter a new value to update it.
                  </p>
                )}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="ssn"
                    type="password"
                    placeholder={hasExistingSSN ? "***-**-**** (on file)" : "XXX-XX-XXXX"}
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <AtSign className="h-5 w-5 text-cyan-500" />
                  Usernames & Handles
                </CardTitle>
                {usernames.length > 0 ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {usernames.length} username{usernames.length > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    None added
                  </span>
                )}
              </div>
              <CardDescription className="text-slate-400">
                Online handles appear in data breaches and people-search sites. Adding them expands our scan coverage.
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
      </>
      )}
    </div>
  );
}
