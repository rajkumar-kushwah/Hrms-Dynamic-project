import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertTriangle, CheckCircle2, MapPin, MoreVertical, PlusIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { Branch, City, State, Country, Pincode, CreateBranchPayload } from "@/types/branch.types";
import { getBranches, createBranch, updateBranch, permanentDeleteBranch } from "@/services/branch.service";
import LocationPicker from "@/pages/LocationPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isSuperAdminRole } from "@/utilis/roleUtils";
import {
    getCountries,
    getStates,
    getCities,
    getPincodes,
} from "@/services/location.service";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { branchSchema } from "@/validation/branch.validation";

type EditForm = {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    countryCode?: string;
    city?: string;
    state?: string;
    pincode?: string;
    managerName?: string;

    latitude?: number;
    longitude?: number;
    geoRadius?: number;
    locationName?: string;
};

const BranchList = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = isSuperAdminRole(user?.role?.name);

    const [branches, setBranches] = React.useState<Branch[]>([]);
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    // const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);

    const [dangerOpen, setDangerOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState("");

    // const [mapOpen, setMapOpen] = React.useState(false);
    const [createMapOpen, setCreateMapOpen] = React.useState(false);
    const [editMapOpen, setEditMapOpen] = React.useState(false);

    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");

    const [countries, setCountries] = React.useState<Country[]>([]);
    const [states, setStates] = React.useState<State[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [pincodes, setPincodes] = React.useState<Pincode[]>([]);

    const [selectedCountry, setSelectedCountry] = React.useState("");
    const [selectedState, setSelectedState] = React.useState("");
    const [selectedCity, setSelectedCity] = React.useState("");

    const [isPhoneValid, setIsPhoneValid] = React.useState(false);
    const [phoneError, setPhoneError] = React.useState("");

    const [isEditPhoneValid, setIsEditPhoneValid] = React.useState(false);
    const [editPhoneError, setEditPhoneError] = React.useState("");

    const [errors, setErrors] = React.useState<{
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        managerName?: string;
    }>({});

    const [editErrors, setEditErrors] = React.useState<{
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        managerName?: string;
    }>({});

    const [form, setForm] = React.useState<CreateBranchPayload>({
        name: "",
        address: "",
        phone: "",
        email: "",
        countryCode: "",
        city: "",
        state: "",
        pincode: "",
        managerName: "",
    });

    const [editForm, setEditForm] = React.useState<EditForm>({});

    React.useEffect(() => {
        loadBranches();
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const res = await getCountries();
            setCountries(res.data);
            console.log("COUNTRIES:", res);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load countries");
        }
    };

    const handleCountryChange = async (countryCode: string) => {
        setSelectedCountry(countryCode);

        // purane selections clear
        setSelectedState("");
        setSelectedCity("");

        setStates([]);
        setCities([]);
        setPincodes([]);

        setForm((prev) => ({
            ...prev,
            countryCode,
            state: "",
            city: "",
            pincode: "",
        }));

        try {
            const res = await getStates(countryCode);

            console.log("STATES:", res);

            setStates(res.data);
        } catch (error) {
            toast.error("Failed to load states");
        }
    };

    const handleStateChange = async (stateCode: string) => {
        setSelectedState(stateCode);

        setSelectedCity("");
        setCities([]);
        setPincodes([]);

        const selectedStateData = states.find(
            (state) => state.iso2 === stateCode
        );

        setForm((prev) => ({
            ...prev,
            state: selectedStateData?.name || "",
            city: "",
            pincode: "",
        }));

        try {
            const res = await getCities(
                selectedCountry,
                stateCode
            );

            console.log("CITIES:", res);

            setCities(res.data);
        } catch (error) {
            toast.error("Failed to load cities");
        }
    };

    // const handleCityChange = async (city: string) => {
    //     setSelectedCity(city);

    //     setForm((prev) => ({
    //         ...prev,
    //         city,
    //         pincode: "",
    //     }));

    //     setPincodes([]);

    //     try {
    //         const res = await getPincodes(city);

    //         console.log("PIN CODES:", res);

    //         setPincodes(res.data);
    //     } catch (error) {
    //         toast.error("Failed to load pincodes");
    //     }
    // };

    const handleCityChange = async (city: string) => {
        setSelectedCity(city);

        setForm((prev) => ({
            ...prev,
            city,
            pincode: "",
        }));

        setPincodes([]);

        try {
            const res = await getPincodes(city);

            console.log("PIN CODES:", res);

            const uniquePincodes: Pincode[] = Array.from(
                new Map<string, Pincode>(
                    res.data.map((item: Pincode) => [
                        item.Pincode,
                        item,
                    ])
                ).values()
            );

            setPincodes(uniquePincodes);
        } catch (error) {
            toast.error("Failed to load pincodes");
        }
    };

    const loadEditLocationData = async (branch: Branch) => {
        try {
            // Country
            setSelectedCountry(branch.countryCode || "");

            if (!branch.countryCode) return;

            // States
            const stateRes = await getStates(branch.countryCode);
            const stateList = stateRes.data as State[];

            setStates(stateList);

            // Branch ka state name hai, API ko state iso2 chahiye
            const selectedStateData = stateList.find(
                (state) =>
                    state.name.trim().toLowerCase() ===
                    (branch.state ?? "").trim().toLowerCase()
            );

            if (!selectedStateData) return;

            setSelectedState(selectedStateData.iso2);

            // Cities
            const cityRes = await getCities(
                branch.countryCode,
                selectedStateData.iso2
            );

            const cityList = cityRes.data as City[];
            setCities(cityList);

            setSelectedCity(branch.city || "");

            // Pincodes
            if (branch.city) {
                const pincodeRes = await getPincodes(branch.city);

                const pincodeList = pincodeRes.data as Pincode[];

                const uniquePincodes: Pincode[] = Array.from(
                    new Map(
                        pincodeList.map((item) => [
                            item.Pincode,
                            item,
                        ])
                    ).values()
                );

                setPincodes(uniquePincodes);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load location data");
        }
    };

    const loadBranches = async () => {
        try {
            const res = await getBranches();
            setBranches(res.data.data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load branches");
        }
    };

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        const result = branchSchema.shape[
            name as keyof typeof branchSchema.shape
        ]?.safeParse(value);

        setErrors((prev) => ({
            ...prev,
            [name]: result?.success ? undefined : result?.error.issues[0]?.message,
        }));
    };
    // const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setEditForm({ ...editForm, [e.target.name]: e.target.value });
    // };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        const result = branchSchema.shape[
            name as keyof typeof branchSchema.shape
        ].safeParse(value);

        setEditErrors((prev) => ({
            ...prev,
            [name]: result.success
                ? undefined
                : result.error.issues[0]?.message,
        }));
    };

    //  Filtered branches
    const filteredBranches = branches.filter((branch) => {
        const matchSearch = searchQuery
            ? branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (branch.city ?? "").toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        const matchStatus = statusFilter !== "all"
            ? (statusFilter === "active" ? branch.isActive : !branch.isActive)
            : true;

        return matchSearch && matchStatus;
    });

    //  Create
    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error("Branch name is required"); return; }
        const result = branchSchema.safeParse({
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            managerName: form.managerName,
        });

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                name: fieldErrors.name?.[0],
                email: fieldErrors.email?.[0],
                phone: fieldErrors.phone?.[0],
                address: fieldErrors.address?.[0],
                managerName: fieldErrors.managerName?.[0],
            });

            return;
        }

        setErrors({});
        try {
            const res = await createBranch(form);
            toast.success("Branch created successfully!");
            setBranches((prev) => [res.data.data, ...prev]);
            setForm({ name: "", address: "", phone: "", email: "", countryCode: "", city: "", state: "", pincode: "", managerName: "" });
            setOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to create branch");
        }
    };
    //  Edit
    const payload = {
        name: editForm.name,
        address: editForm.address,
        phone: editForm.phone,
        email: editForm.email,
        countryCode: editForm.countryCode,
        city: editForm.city,
        state: editForm.state,
        pincode: editForm.pincode,
        managerName: editForm.managerName,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        geoRadius: editForm.geoRadius,
        locationName: editForm.locationName
    };
    //  Update
    const handleUpdate = async () => {
        if (!selectedBranch) return;
        const result = branchSchema.safeParse({
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            address: editForm.address,
            managerName: editForm.managerName,
        });

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setEditErrors({
                name: fieldErrors.name?.[0],
                email: fieldErrors.email?.[0],
                phone: fieldErrors.phone?.[0],
                address: fieldErrors.address?.[0],
                managerName: fieldErrors.managerName?.[0],
            });

            return;
        }

        setEditErrors({});

        try {
            const res = await updateBranch(selectedBranch.id, payload);

            // setBranches(res.data.data);
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, ...res.data.data } : b));
            toast.success("Branch updated successfully!");
            setEditOpen(false);
            setSelectedBranch(null);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    };

    //  Delete
    // const handleDelete = async () => {
    //     if (!selectedBranch) return;
    //     try {
    //         await deleteBranch(selectedBranch.id);
    //         toast.success("Branch deactivated successfully!");
    //         setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, isActive: false } : b));
    //         setDeleteOpen(false);
    //         setSelectedBranch(null);
    //     } catch (err: any) {
    //         toast.error(err?.message || "Failed to delete branch");
    //     }
    // };

    const handleToggleStatus = async () => {
        if (!selectedBranch) return
        try {
            const res = await updateBranch(selectedBranch.id, { isActive: !selectedBranch.isActive });
            toast.success(`Branch ${selectedBranch.isActive ? "activated" : "deactivated"} successfully!`);
            setBranches((prev) => prev.map((b) => b.id === selectedBranch.id ? { ...b, ...res.data.data } : b));
            setStatusDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.message || "Failed to update branch");
        }
    }


    // handle parmanet delete branch and confirmation text

    const handlePermanentDelete = async () => {
        if (confirmText !== selectedBranch?.name) {
            toast.error("Branch name doesn't match");
            return;
        }
        try {
            await permanentDeleteBranch(selectedBranch.id);
            toast.success("Branch permanently deleted!");
            setBranches((prev) => prev.filter((b) => b.id !== selectedBranch.id));
            setDangerOpen(false);
            setEditOpen(false);
            setConfirmText("");
        } catch (err: any) {
            const message =
                err?.message || "Failed to delete branch";
            toast.error(message);
        }

    }


    return (
        <div className="flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3 flex-wrap">
                    <Input
                        placeholder="Search branch name, code or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button size="sm" variant="add" onClick={() => setOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Branch
                </Button>
            </div>

            {/* Create Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Branch</DialogTitle>
                        <DialogDescription>Fill branch details</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <div>
                            <Label>Branch Name *</Label>
                            <Input type="text" name="name" placeholder="e.g. Delhi Branch" value={form.name} onChange={handleChange} />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>Phone</Label>

                                <PhoneInput
                                    value={form.phone}
                                    onChange={(value) => {
                                        const phone = value || "";

                                        setForm((prev) => ({
                                            ...prev,
                                            phone,
                                        }));

                                        if (!phone) {
                                            setPhoneError("");
                                            setIsPhoneValid(false);
                                            return;
                                        }

                                        const valid = isValidPhoneNumber(phone);

                                        setIsPhoneValid(valid);
                                        setPhoneError(valid ? "" : "Invalid phone number");
                                    }}
                                    placeholder="Enter phone number"
                                    defaultCountry="IN"
                                    international
                                    withCountryCallingCode
                                    countrySelectProps={{
                                        className:
                                            "dark:[color-scheme:dark] dark:bg-background dark:text-foreground",
                                    }}
                                    numberInputProps={{
                                        className:
                                            "h-9 w-full bg-[var(--themePrimary)]/5 focus-visible:border-[var(--themePrimary)] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground",
                                    }}
                                />

                                {/* Invalid */}
                                {phoneError && (
                                    <p className="mt-1 text-sm text-red-500 flex gap-2 items-center">
                                        <XCircle className="h-4 w-4" />
                                        {phoneError}
                                    </p>
                                )}

                                {/* Valid */}
                                {isPhoneValid && !phoneError && (
                                    <p className="mt-1 text-sm text-green-600 flex gap-2 items-center">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Valid phone number
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <Label>Email</Label>
                                <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Country */}
                        <div>
                            <Label>Country</Label>

                            <Select
                                value={selectedCountry}
                                onValueChange={handleCountryChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>

                                <SelectContent position="popper">
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country.iso2}
                                            value={country.iso2}
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* State + City + Pincode */}
                        <div className="flex gap-2">

                            {/* State */}
                            <div className="flex-1">
                                <Label>State</Label>

                                <Select
                                    value={selectedState}
                                    onValueChange={handleStateChange}
                                    disabled={!selectedCountry}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>

                                    <SelectContent position="popper">
                                        {states.map((state) => (
                                            <SelectItem
                                                key={state.iso2}
                                                value={state.iso2}
                                            >
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* City */}
                            <div className="flex-1">
                                <Label>City</Label>

                                <Select
                                    value={selectedCity}
                                    onValueChange={handleCityChange}
                                    disabled={!selectedState}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select City" />
                                    </SelectTrigger>

                                    <SelectContent position="popper">
                                        {cities.map((city) => (
                                            <SelectItem
                                                key={city.name}
                                                value={city.name}
                                            >
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Pincode */}
                            <div className="flex-1">
                                <Label>Pincode</Label>

                                <Select
                                    value={form.pincode}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            pincode: value,
                                        }))
                                    }
                                    disabled={!selectedCity}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Pincode" />
                                    </SelectTrigger>

                                    <SelectContent position="popper">
                                        {pincodes.map((pincode, index) => (
                                            <SelectItem
                                                key={`${pincode.Pincode}-${index}`}
                                                value={pincode.Pincode}
                                            >
                                                {pincode.Pincode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                        <div>
                            <Label>Address</Label>
                            <Input type="text" name="address" placeholder="Full Address" value={form.address} onChange={handleChange} />
                            {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
                        </div>
                        <div>
                            <Label>Manager Name</Label>
                            <Input type="text" name="managerName" placeholder="Manager Name" value={form.managerName} onChange={handleChange} />
                            {errors.managerName && <span className="text-red-500 text-xs">{errors.managerName}</span>}
                        </div>
                        <div>
                            <Label>Branch Location</Label>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="cursor-pointer" onClick={() => setCreateMapOpen(true)} type="button">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {form.latitude ? "Update Location" : "Set Location"}
                                </Button>
                                {form.latitude !== undefined && form.longitude !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                        {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)} — {form.geoRadius}m radius
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button variant="add" onClick={handleSubmit}>Create Branch</Button>
                    </div>

                </DialogContent>
            </Dialog>
            <LocationPicker
                open={createMapOpen}
                onOpenChange={setCreateMapOpen}
                initialLat={form.latitude}
                initialLng={form.longitude}
                initialRadius={form.geoRadius}
                initialLocationName={form.locationName}
                onConfirm={(lat, lng, radius, locationName) => {
                    setForm((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        geoRadius: radius,
                        locationName,
                    }));
                }}
            />
            {/* Edit Dialog */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Branch — {selectedBranch?.name}</DialogTitle>
                            <DialogDescription>Fill branch details</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3">
                            <div>
                                <Label>Branch Name</Label>
                                <Input type="text" name="name" value={editForm.name ?? ""} onChange={handleEditChange} />
                                {editErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {editErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label>Phone</Label>

                                    <PhoneInput
                                        value={editForm.phone ?? ""}
                                        onChange={(value) => {
                                            const phone = value || "";

                                            setEditForm((prev) => ({
                                                ...prev,
                                                phone,
                                            }));

                                            if (!phone) {
                                                setEditPhoneError("");
                                                setIsEditPhoneValid(false);
                                                return;
                                            }

                                            const valid = isValidPhoneNumber(phone);

                                            setIsEditPhoneValid(valid);
                                            setEditPhoneError(valid ? "" : "Invalid phone number");
                                        }}
                                        placeholder="Enter phone number"
                                        defaultCountry="IN"
                                        international
                                        withCountryCallingCode
                                        countrySelectProps={{
                                            className:
                                                "dark:[color-scheme:dark] dark:bg-background dark:text-foreground",
                                        }}
                                        numberInputProps={{
                                            className:
                                                "h-9 w-full bg-[var(--themePrimary)]/5 focus-visible:border-[var(--themePrimary)] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground",
                                        }}
                                    />

                                    {editPhoneError && (
                                        <p className="mt-1 text-sm text-red-500 flex gap-2 items-center">
                                            <XCircle className="h-4 w-4" />
                                            {editPhoneError}
                                        </p>
                                    )}

                                    {isEditPhoneValid && !editPhoneError && (
                                        <p className="mt-1 text-sm text-green-600 flex gap-2 items-center">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Valid phone number
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label>Email</Label>

                                    <Input
                                        type="email"
                                        name="email"
                                        value={editForm.email ?? ""}
                                        onChange={handleEditChange}
                                    />

                                    {editErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {editErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Country */}
                            <div>
                                <Label>Country</Label>

                                <Select
                                    value={editForm.countryCode ?? ""}
                                    onValueChange={async (countryCode) => {
                                        setEditForm((prev) => ({
                                            ...prev,
                                            countryCode,
                                            state: "",
                                            city: "",
                                            pincode: "",
                                        }));

                                        setSelectedCountry(countryCode);
                                        setSelectedState("");
                                        setSelectedCity("");

                                        setStates([]);
                                        setCities([]);
                                        setPincodes([]);

                                        try {
                                            const res = await getStates(countryCode);

                                            const stateList = res.data as State[];

                                            setStates(stateList);
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Failed to load states");
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>

                                    <SelectContent position="popper">
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.iso2}
                                                value={country.iso2}
                                            >
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>


                            {/* State + City + Pincode */}
                            <div className="flex gap-2">

                                {/* State */}
                                <div className="flex-1 min-w-0">
                                    <Label>State</Label>

                                    <Select
                                        value={
                                            states.find(
                                                (state) =>
                                                    state.name.trim().toLowerCase() ===
                                                    (editForm.state ?? "").trim().toLowerCase()
                                            )?.iso2 ?? ""
                                        }
                                        onValueChange={async (stateCode) => {
                                            const selectedStateData = states.find(
                                                (state) => state.iso2 === stateCode
                                            );

                                            setEditForm((prev) => ({
                                                ...prev,
                                                state: selectedStateData?.name ?? "",
                                                city: "",
                                                pincode: "",
                                            }));

                                            setSelectedState(stateCode);
                                            setSelectedCity("");

                                            setCities([]);
                                            setPincodes([]);

                                            try {
                                                const res = await getCities(
                                                    editForm.countryCode ?? "",
                                                    stateCode
                                                );

                                                const cityList = res.data as City[];

                                                setCities(cityList);
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Failed to load cities");
                                            }
                                        }}
                                        disabled={!editForm.countryCode}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>

                                        <SelectContent position="popper">
                                            {states.map((state) => (
                                                <SelectItem
                                                    key={state.iso2}
                                                    value={state.iso2}
                                                >
                                                    {state.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>


                                {/* City */}
                                <div className="flex-1 min-w-0">
                                    <Label>City</Label>

                                    <Select
                                        value={editForm.city ?? ""}
                                        onValueChange={async (city) => {
                                            setEditForm((prev) => ({
                                                ...prev,
                                                city,
                                                pincode: "",
                                            }));

                                            setSelectedCity(city);
                                            setPincodes([]);

                                            try {
                                                const res = await getPincodes(city);

                                                const pincodeList = res.data as Pincode[];

                                                const uniquePincodes: Pincode[] = Array.from(
                                                    new Map(
                                                        pincodeList.map((item) => [
                                                            item.Pincode,
                                                            item,
                                                        ])
                                                    ).values()
                                                );

                                                setPincodes(uniquePincodes);
                                            } catch (error) {
                                                console.error(error);
                                                toast.error("Failed to load pincodes");
                                            }
                                        }}
                                        disabled={!editForm.state}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>

                                        <SelectContent position="popper">
                                            {cities.map((city) => (
                                                <SelectItem
                                                    key={city.name}
                                                    value={city.name}
                                                >
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>


                                {/* Pincode */}
                                <div className="flex-1 min-w-0">
                                    <Label>Pincode</Label>

                                    <Select
                                        value={editForm.pincode ?? ""}
                                        onValueChange={(value) => {
                                            setEditForm((prev) => ({
                                                ...prev,
                                                pincode: value,
                                            }));
                                        }}
                                        disabled={!editForm.city}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pincode" />
                                        </SelectTrigger>

                                        <SelectContent position="popper">
                                            {pincodes.map((pincode) => (
                                                <SelectItem
                                                    key={pincode.Pincode}
                                                    value={pincode.Pincode}
                                                >
                                                    {pincode.Pincode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input type="text" name="address" value={editForm.address ?? ""} onChange={handleEditChange} />
                                {editErrors.address && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {editErrors.address}
                                    </p>
                                )}
                            </div>


                            <div>
                                <Label>Manager Name</Label>
                                <Input type="text" name="managerName" value={editForm.managerName ?? ""} onChange={handleEditChange} />
                                {editErrors.managerName && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {editErrors.managerName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Branch Location</Label>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="add"
                                        type="button"
                                        onClick={() => setEditMapOpen(true)}
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {editForm.latitude !== undefined ? "Update Location" : "Set Location"}
                                    </Button>

                                    {editForm.latitude != null &&
                                        editForm.longitude != null && (
                                            <span className="text-xs text-muted-foreground">
                                                {editForm.latitude.toFixed(4)},{" "}
                                                {editForm.longitude.toFixed(4)} — {editForm.geoRadius ?? 0}m radius
                                            </span>
                                        )}
                                </div>
                            </div>
                            <Button variant="add" onClick={handleUpdate}>Update Branch</Button>
                        </div>
                        <div >
                            <LocationPicker
                                open={editMapOpen}
                                onOpenChange={setEditMapOpen}
                                initialLat={editForm.latitude}
                                initialLng={editForm.longitude}
                                initialRadius={editForm.geoRadius}
                                initialLocationName={editForm.locationName}
                                onConfirm={(lat, lng, radius, locationName) => {
                                    setEditForm((prev) => ({
                                        ...prev,
                                        latitude: lat,
                                        longitude: lng,
                                        geoRadius: radius,
                                        locationName,
                                    }));
                                }}
                            />
                        </div>
                        {/* edit Dialog ke ander dialog permanent delete confirmation hoga */}
                        {isSuperAdmin && (
                            <div className="border border-red-200 rounded-lg p-4 mt-4 bg-red-50">
                                <h4 className="text-red-700 font-semibold flex items-center gap-2 text-sm">
                                    <AlertTriangle className="h-4 w-4" /> Danger Zone
                                </h4>
                                <p className="text-xs text-red-600 mt-1">
                                    Permanent Delete this branch. Only possible if no employee/user is assigned to this branch.
                                </p>
                                <Button variant="destructive" size="sm" className="sm cursor-pointer" onClick={() => setDangerOpen(true)}>Delete Permanently</Button>
                            </div>
                        )}
                        {/* Comfirmation Dialog */}
                        <Dialog open={dangerOpen} onOpenChange={setDangerOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-red-700"> Permanent Delete Branch</DialogTitle>
                                    <DialogDescription> Are you sure you want to delete <strong className="font-semibold bg-muted">{selectedBranch?.name}</strong> This action cannot be undone.</DialogDescription>
                                </DialogHeader>
                                <div>
                                    <Label>Type<strong> {selectedBranch?.name}</strong> To Confirm</Label>
                                    <Input type="text" name="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type branch name" />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setDangerOpen(false)}>Cancel</Button>
                                    <Button variant="destructive" disabled={confirmText !== selectedBranch?.name} onClick={handlePermanentDelete} className=" cursor-pointer"> I understand, delete permanently</Button>

                                </div>
                            </DialogContent>
                        </Dialog>

                    </DialogContent>
                </Dialog>
            </div>

            {/* Delete Confirm */}
            {/* <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Branch</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate <strong>{selectedBranch?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Deactivate</Button>
                    </div>
                </DialogContent>
            </Dialog> */}


            {/* dialog active and deactive  */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Branch</DialogTitle>
                        <DialogDescription>
                            You are about to
                            <strong className="font-semibold ">
                                {" "}
                                {selectedBranch?.isActive ? "deactivate" : "activate"}
                            </strong>
                            <strong> {selectedBranch?.name}</strong>
                            {selectedBranch?.isActive
                                ? " You can activate it again later."
                                : " You can deactivate it again later."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleToggleStatus}>{selectedBranch?.isActive ? "Deactivate" : "Activate"}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Table */}
            <div className="bg-card  grid grid-cols-1 rounded border w-full overflow-x-auto">
                <div className="h-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead className="min-w-37.5">Name</TableHead>
                                <TableHead className="min-w-25">Code</TableHead>
                                {isSuperAdmin && <TableHead className="min-w-37.5">Company</TableHead>}
                                <TableHead className="min-w-25">City</TableHead>
                                <TableHead className="min-w-25">Phone</TableHead>
                                <TableHead className="min-w-37.5">Manager</TableHead>
                                <TableHead className="min-w-40">Location</TableHead>
                                <TableHead className="min-w-20">Status</TableHead>
                                <TableHead className="sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.map((branch, index) => (
                                <TableRow key={branch.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{branch.name}</TableCell>
                                    <TableCell>{branch.code}</TableCell>
                                    {isSuperAdmin && <TableCell>{branch.company?.name ?? "—"}</TableCell>}
                                    <TableCell>{branch.city ?? "—"}</TableCell>
                                    <TableCell>{branch.phone ?? "—"}</TableCell>
                                    <TableCell>{branch.managerName ?? "—"}</TableCell>
                                    <TableCell>
                                        {branch.locationName ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={branch.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"}>
                                            {branch.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="sticky right-0 bg-card">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            setSelectedBranch(branch);

                                                            setEditForm({
                                                                name: branch.name,
                                                                address: branch.address,
                                                                phone: branch.phone,
                                                                email: branch.email,
                                                                countryCode: branch.countryCode,
                                                                city: branch.city,
                                                                state: branch.state,
                                                                pincode: branch.pincode,
                                                                managerName: branch.managerName,
                                                                latitude: branch.latitude,
                                                                longitude: branch.longitude,
                                                                geoRadius: branch.geoRadius,
                                                                locationName: branch.locationName,
                                                            });
                                                            const phone = branch.phone || "";

                                                            setIsPhoneValid(
                                                                !!phone && isValidPhoneNumber(phone)
                                                            );

                                                            setPhoneError(
                                                                phone && !isValidPhoneNumber(phone)
                                                                    ? "Invalid phone number"
                                                                    : ""
                                                            );
                                                            // Old location data clear
                                                            setStates([]);
                                                            setCities([]);
                                                            setPincodes([]);

                                                            await loadEditLocationData(branch);

                                                            setEditOpen(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive"
                                                        className="text-red-600" onClick={() => {
                                                            setSelectedBranch(branch);
                                                            setStatusDialogOpen(true);
                                                        }}>
                                                        {branch.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {branches.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                        No branches found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default BranchList;