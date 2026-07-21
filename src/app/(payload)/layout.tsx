/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {/* TEMP diagnostic: capture client errors that blank the admin on Vercel. Remove after. */}
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__adminErrs=[];addEventListener('error',function(e){window.__adminErrs.push('ERR:'+(e.message||'')+' @@ '+(e.filename||'')+':'+(e.lineno||''))});addEventListener('unhandledrejection',function(e){var r=e.reason;window.__adminErrs.push('REJECT:'+String(r&&(r.stack||r.message)||r).slice(0,700))});var _ce=console.error;console.error=function(){try{window.__adminErrs.push('CE:'+Array.prototype.map.call(arguments,String).join(' ').slice(0,700))}catch(_){}return _ce.apply(console,arguments)};`,
      }}
    />
    {children}
  </RootLayout>
)

export default Layout
