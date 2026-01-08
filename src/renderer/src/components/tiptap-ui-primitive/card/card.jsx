"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/tiptap-utils"
import "@/components/tiptap-ui-primitive/card/card.scss"

const Card = forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("tiptap-card", className)} {...props} />;
})
Card.displayName = "Card"

const CardHeader = forwardRef(({ className, ...props }, ref) => {
  return (<div ref={ref} className={cn("tiptap-card-header", className)} {...props} />);
})
CardHeader.displayName = "CardHeader"

const CardBody = forwardRef(({ className, ...props }, ref) => {
  return (<div ref={ref} className={cn("tiptap-card-body", className)} {...props} />);
})
CardBody.displayName = "CardBody"

const CardItemGroup = forwardRef(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn("tiptap-card-item-group", className)}
      {...props} />
  );
})
CardItemGroup.displayName = "CardItemGroup"

const CardGroupLabel = forwardRef(({ className, ...props }, ref) => {
  return (<div ref={ref} className={cn("tiptap-card-group-label", className)} {...props} />);
})
CardGroupLabel.displayName = "CardGroupLabel"

const CardFooter = forwardRef(({ className, ...props }, ref) => {
  return (<div ref={ref} className={cn("tiptap-card-footer", className)} {...props} />);
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardBody, CardItemGroup, CardGroupLabel }
