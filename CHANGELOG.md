# Changelog

## 1.0.1

### Patch Changes

- 707a13b: Use `configuration.theme.typography` as the fallback when no font options are set, instead of always applying the hard-coded Quartz default fonts (jackyzha0/quartz#2507).
- 707a13b: Self-hosted fonts now work on localhost and under a base path: font URLs in `quartz-fonts.css` are relative to the stylesheet and the stylesheet link is relative to each page (jackyzha0/quartz#2547). `baseUrl` is no longer required for `fontOrigin: "selfHosted"`.

## 1.0.0

### Major Changes

- Stable 1.0 release. All `@quartz-community/*` dependencies now use `^1.0.0` ranges.

  Pre-1.0 caret ranges pinned the minor version (`^0.2.1` means `>=0.2.1 <0.3.0`), so
  published fixes to shared packages could never be resolved by dependents. Moving the
  ecosystem to 1.0 makes caret ranges behave conventionally.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Quartz community plugin template.
