---
title: "My Journey with LLVM (Final Evaluation)"
date: 2020-08-28T13:18:28+08:00
tags: ["LLVM", "GSoC"]
---

My GSoC comes to an end and this is a report of my work during the last 3 months. My project is adding DWARF support to `yaml2obj`, especially `yaml2elf`. The original proposal is [here](https://docs.google.com/document/d/13wNr4JbXtzaOly-UsFt7vxI3LKXzik_lVU58ICqslWM/edit?usp=sharing).

<!--more-->

### Implementation Status

With the help of my mentor James and other community members, I was able to accomplish most of the milestones in my original proposal. Now, the usability of the tool has been improved a lot. Some outstanding features are listed below.

**\* The `InitialLength` fields of DWARF sections are replaced with `Format` and `Length`.** At first, we have to hardcode the `InitialLength` field to instruct the tool to emit a proper DWARF64 or a DWARF32 section, e.g.,

```yaml
## DWARF32 section.
InitialLength:
  TotalLength32: 0x1234

## DWARF64 section.
InitialLength:
  TotalLength32: 0xffffffff
  TotalLength64: 0x1234
```

Now, `yaml2obj` emits DWARF32 sections by default and the `Length` field can be omitted, `yaml2obj` will calculate it for us (Patches that address this issue: [D82622](https://reviews.llvm.org/D82622), [D85880](https://reviews.llvm.org/D85880), [D81063](https://reviews.llvm.org/D81063), [D84008](https://reviews.llvm.org/D84008), [D86590](https://reviews.llvm.org/D86590), [D84911](https://reviews.llvm.org/D84911)).

```yaml
## DWARF32 section.
## The Format and Length fields can be omitted.
## We don't need to care about them.

## DWARF64 section.
Format: DWARF64 ## We only need to specify the Format field.
```

**\* `yaml2obj` supports emitting multiple abbrev tables.** `yaml2obj` only supported emitting a single abbrev table and multiple compilation units had to share the same abbrev table before [D86194](https://reviews.llvm.org/D86194) and [D83116](https://reviews.llvm.org/D83116). Now, `yaml2obj` is able to emit multiple abbrev tables and compilation units can be linked to any one of them. We add an optional field `ID` to abbrev tables and an optional field `AbbrevTableID` to compilation units. Compilation units can use `AbbrevTableID` to link the abbrev table with the same `ID`. However, the `AbbrOffset` field of compilation units which corresponds to the `debug_abbrev_offset` field still needs to be specified. If [D86614](https://reviews.llvm.org/D86614) can be accepted in the future, we don’t need to calculate it and specify it any more!

```yaml
debug_abbrev:
  - ID: 0
    Table:
      ...
  - ID: 1
    Table:
      ...
debug_info:
  - ...
    AbbrevTableID: 1 ## Reference the second abbrev table.
  - ...
    AbbrevTableID: 0 ## Reference the first abbrev table.
```

**\* More DWARF sections are supported.** The `debug_rnglists`, `debug_loclists`, `debug_addr` and `debug_str_offsets` sections are newly supported in `yaml2obj`. Check out [D83624](https://reviews.llvm.org/D83624), [D84234](https://reviews.llvm.org/D84234), [D81541](https://reviews.llvm.org/D81541) and [D83853](https://reviews.llvm.org/D83853) for more information!

**\* The DWARF support is added to `elf2yaml` and improved in `macho2yaml`.** At first, the output of `macho2yaml` is noisy. It dumps the DWARF sections twice, one in the `Sections:` entry and one in the `DWARF:` entry, e.g.,

```yaml
## The content of the debug_str section is dumped twice!
Sections:
  - sectname: __debug_str
    ...
    content: 6D61696E00 ## "main\0"
DWARF:
  debug_str:
    - main
```

After [D85506](https://reviews.llvm.org/D85506), if the DWARF parser fails to parse the DWARF sections into the `DWARF:` entry, `obj2yaml` will dump them as raw content sections, otherwise, they will be presented as structured DWARF sections in the `DWARF:` entry. Besides, [D85094](https://reviews.llvm.org/D85094) adds DWARF support to `elf2yaml`. Although it only supports dumping the `debug_aranges` section, we can easily extend it in the future.

### Unfinished Tasks

**\* Allow users to describe DIEs at a high level.** In my original proposal, we plan to make `yaml2obj` support describing DIEs at a high level. However, `yaml2obj` didn’t support emitting multiple abbrev tables at that time and I spent some time on enabling it to emit multiple abbrev tables and link compilation units with them. I’m not going to leave the community and I will improve it in the future.

My username on Phabricator is [@Higuoxing](https://reviews.llvm.org/p/Higuoxing/). Please feel free to ping me if you have trouble in or encountering bugs in crafting DWARF test cases in YAML. I’m very happy to help!

### Acknowledgements

I would love to express my sincere gratitude to @jhenderson(James Henderson) for mentoring me during this project. Besides, I would like to thank @grimar(George Rimar), @MaskRay(Fangrui Song), @labath(Pavel Labath), @dblaikie(David Blaikie), @aprantl(Adrian Prantl) and @probinson(Paul Robinson) for reviewing my patches, patiently answering my questions and leaving comments to my proposal!

### Proposed Changes (Only accepted and ongoing ones are listed)

**Ongoing:**

D86614 [[DWARFYAML] Make the debug_abbrev_offset field optional.](https://reviews.llvm.org/D86614)

D86545 [[DWARFYAML] Abbrev codes in a new abbrev table should start from 1 (by default).](https://reviews.llvm.org/D86545)

D85289 [[DWARFYAML][debug_info] Rename some mapping keys. NFC.](https://reviews.llvm.org/D85289)

**Porting the existing DWARF support to `yaml2elf`:**

D80203 [[ObjectYAML][DWARF] Add DWARF entry in ELFYAML.](https://reviews.llvm.org/D80203)

D80972 [[ObjectYAML][DWARF] Support emitting the .debug_aranges section in ELFYAML.](https://reviews.llvm.org/D80203)

D81217 [[ObjectYAML][DWARF] Support emitting .debug_ranges section in ELFYAML.](https://reviews.llvm.org/D81217)

D81450 [[ObjectYAML][ELF] Add support for emitting the .debug_line section.](https://reviews.llvm.org/D81450)

D81820 [[ObjectYAML][ELF] Add support for emitting the .debug_abbrev section.](https://reviews.llvm.org/D81820)

D82073 [[ObjectYAML][ELF] Add support for emitting the .debug_info section.](https://reviews.llvm.org/D82073)

D82347 [[ObjectYAML][ELF] Add support for emitting the .debug_pubtypes section.](https://reviews.llvm.org/D82347)

D82367 [[ObjectYAML][ELF] Add support for emitting the .debug_gnu_pubnames/pubtypes sections.](https://reviews.llvm.org/D82367)

D82296 [[ObjectYAML][ELF] Add support for emitting the .debug_pubnames section.](https://reviews.llvm.org/D82296)

**Introducing new DWARF sections to `yaml2obj`:**

D81541 [[ObjectYAML][DWARF] Implement the .debug_addr section.](https://reviews.llvm.org/D81541)

D83624 [[DWARFYAML] Implement the .debug_rnglists section.](https://reviews.llvm.org/D83624)

D83853 [[DWARFYAML] Implement the .debug_str_offsets section.](https://reviews.llvm.org/D83853)

D84234 [[DWARFYAML] Implement the .debug_loclists section.](https://reviews.llvm.org/D84234)

**Adding DWARF support to obj2yaml:**

D85094 [[obj2yaml] Add support for dumping the .debug_aranges section.](https://reviews.llvm.org/D85094)

**Refactoring work (improving error handling, making YAML fields optional, adding DWARF64 support, etc):**

D80535 [[ObjectYAML][MachO] Add error handling in MachOEmitter.](https://reviews.llvm.org/D80535)

D80861 [[ObjectYAML][DWARF] Let `dumpPubSection` return `DWARFYAML::PubSection`.](https://reviews.llvm.org/D80861)

D81063 [[DWARFYAML][debug_aranges] Replace InitialLength with Format and Length.](https://reviews.llvm.org/D81063)

D81051 [[ObjectYAML][ELF] Let the endianness of DWARF sections be inferred from FileHeader.](https://reviews.llvm.org/D81051)

D86590 [[DWARFYAML] Make the unit_length and header_length fields optional.](https://reviews.llvm.org/D86590)

D86537 [[DWARFYAML] Make the 'Attributes' field optional.](https://reviews.llvm.org/D86537)

D83116 [[DWARFYAML] Add support for referencing different abbrev tables.](https://reviews.llvm.org/D83116)

D86194 [[DWARFYAML] Add support for emitting multiple abbrev tables.](https://reviews.llvm.org/D86194)

D86192 [[obj2yaml] Refactor the .debug_pub* sections dumper.](https://reviews.llvm.org/D86192)

D85880 [[DWARFYAML] Replace InitialLength with Format and Length. NFC.](https://reviews.llvm.org/D85880)

D85805 [[DWARFYAML] Make the address size of compilation units optional.](https://reviews.llvm.org/D85805)

D85821 [[MachOYAML] Simplify the section data emitting function. NFC.](https://reviews.llvm.org/D85821)

D85707 [[DWARFYAML] Let the address size of line tables inferred from the object file.](https://reviews.llvm.org/D85707)

D85506 [[macho2yaml] Refactor the DWARF section dumpers.](https://reviews.llvm.org/D85506)

D85496 [[macho2yaml] Remove unused functions. NFC.](https://reviews.llvm.org/D85496)

D85397 [[DWARFYAML][debug_info] Make the 'Values' field optional.](https://reviews.llvm.org/D85397)

D85405 [[obj2yaml] Test dumping an empty .debug_aranges section.](https://reviews.llvm.org/D85405)

D84496 [[DWARFYAML] Replace 'Format', 'Version', etc with 'FormParams'. NFC.](https://reviews.llvm.org/D84496)

D85296 [[DWARFYAML][debug_info] Pull out dwarf::FormParams from DWARFYAML::Unit.](https://reviews.llvm.org/D85296)

D85179 [[DebugInfo][unittest] Use YAML to generate the .debug_loclists section.](https://reviews.llvm.org/D85179)

D85006 [[DWARFYAML] Offsets should be omitted when the OffsetEntryCount is 0.](https://reviews.llvm.org/D85006)

D84921 [[DWARFYAML] Make the debug_aranges entry optional.](https://reviews.llvm.org/D84921)

D84952 [[DWARFYAML] Add helper function getDWARFEmitterByName(). NFC.](https://reviews.llvm.org/D84952)

D85003 [[DWARFYAML] Add emitDebug[GNU]Pub[names/types] functions. NFC.](https://reviews.llvm.org/D85003)

D84911 [[DWARFYAML] Make the 'Length' field of the address range table optional.](https://reviews.llvm.org/D84911)

D84907 [[DWARFYAML] Make the 'AddressSize', 'SegmentSelectorSize' fields optional.](https://reviews.llvm.org/D84907)

D84624 [[DWARFYAML] Rename checkListEntryOperands() to checkOperandCount(). NFC.](https://reviews.llvm.org/D84624)

D84618 [[DWARFYAML] Add support for emitting custom range list content.](https://reviews.llvm.org/D84618)

D83282 [[DWARFYAML] Refactor: Pull out member functions to DWARFYAMLUtils.cpp.](https://reviews.llvm.org/D83282)

D84383 [[DWARFYAML] Pull out common helper functions for rnglist and loclist tables. NFC.](https://reviews.llvm.org/D84383)

D84008 [[DWARFYAML] Refactor emitDebugInfo() to make the length be inferred.](https://reviews.llvm.org/D84008)

D84239 [[DWARFYAML] Refactor range list table to hold more data structure.](https://reviews.llvm.org/D84239)

D83749 [[DWARFYAML] Add support for emitting value forms of strx, addrx, etc.](https://reviews.llvm.org/D83749)

D83452 [[DWARFYAML] Use override instead of virtual for better safety.](https://reviews.llvm.org/D83452)

D83220 [[DWARFYAML][unittest] Refactor parseDWARFYAML().](https://reviews.llvm.org/D83220)

D82435 [[DWARFYAML][debug_gnu_*] Add the missing context `IsGNUStyle`. NFC.](https://reviews.llvm.org/D82435)

D82933 [[DWARFYAML][debug_abbrev] Emit 0 byte for terminating abbreviations.](https://reviews.llvm.org/D82933)

D82622 [[DWARFYAML][debug_info] Replace 'InitialLength' with 'Format' and 'Length'.](https://reviews.llvm.org/D82622)

D82630 [[ObjectYAML][DWARF] Collect diagnostic message when YAMLParser fails.](https://reviews.llvm.org/D82630)

D82351 [[ObjectYAML][DWARF] Remove unused context. NFC.](https://reviews.llvm.org/D82351)

D82275 [[DWARFYAML][debug_info] Add support for error handling.](https://reviews.llvm.org/D82275)

D82173 [[DWARFYAML][debug_info] Use 'AbbrCode' to index the abbreviation.](https://reviews.llvm.org/D82173)

D81826 [[DWARFYAML][debug_abbrev] Make the abbreviation code optional.](https://reviews.llvm.org/D81826)

D81915 [[ObjectYAML][DWARF] Let writeVariableSizedInteger() return Error.](https://reviews.llvm.org/D81915)

D81709 [[ObjectYAML][DWARF] Let the target address size be inferred from FileHeader.](https://reviews.llvm.org/D81709)

D81529 [[ObjectYAML][test] Use a single test file to test the empty 'DWARF' entry.](https://reviews.llvm.org/D81529)

D80722 [[ObjectYAML][DWARF] Make the `PubSection` optional.](https://reviews.llvm.org/D80722)

D81220 [[DWARFYAML][debug_ranges] Make the "Offset" field optional.](https://reviews.llvm.org/D81220)

D81528 [[DWARFYAML] Add support for emitting DWARF64 .debug_aranges section.](https://reviews.llvm.org/D81528)

D81357 [[DWARFYAML][debug_ranges] Emit an error message for invalid offset.](https://reviews.llvm.org/D81357)

D81356 [[ObjectYAML] Add support for error handling in DWARFYAML. NFC.](https://reviews.llvm.org/D81356)

**Bugfixes**

D85717 [[DWARFYAML] Teach yaml2obj emit the correct line table program.](https://reviews.llvm.org/D85717)

D85180 [[YAMLTraits] Fix mapping \<none\> value that followed by comments.](https://reviews.llvm.org/D85180)

D84640 [[llvm-readelf] Fix emitting incorrect number of spaces in '--hex-dump'.](https://reviews.llvm.org/D84640)

D82621 [[DWARFYAML][debug_info] Teach yaml2obj emit correct DWARF64 unit header.](https://reviews.llvm.org/D82621)

D82139 [[DWARFYAML][debug_info] Fix array index out of bounds error.](https://reviews.llvm.org/D82139)

D80862 [[ObjectYAML][test] Address comments in D80203.](https://reviews.llvm.org/D80862)
