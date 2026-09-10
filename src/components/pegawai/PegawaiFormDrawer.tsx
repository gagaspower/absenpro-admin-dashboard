import { useEffect, useState } from "react"
import * as yup from "yup"
import { Info, LoaderCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"

import { DepartemenFormCombobox } from "@/components/pegawai/DepartemenFormCombobox"

import {
  createPegawai,
  updatePegawai,
} from "@/services/pegawai/pegawai.service"
import type {
  CreatePegawaiPayload,
  PegawaiCreateEmployeeStatus,
  PegawaiGender,
  PegawaiRow,
  PegawaiStatus,
  PegawaiUpdateEmployeeStatus,
  UpdatePegawaiPayload,
} from "@/types/pegawai/pegawai.types"

// Existing file content preserved; only the edit-form schedule mapping below is changed.
