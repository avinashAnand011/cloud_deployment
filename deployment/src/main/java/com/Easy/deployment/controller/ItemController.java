package com.Easy.deployment.controller;


import com.Easy.deployment.entity.Item;
import com.Easy.deployment.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    // Accessible by any authenticated user (USER or ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('user') or hasRole('admin')") // Note: roles are lowercase from Keycloak realm_access.roles
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Accessible by any authenticated user (USER or ADMIN)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('user') or hasRole('admin')")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return ResponseEntity.ok(item);
    }

    // Accessible only by ADMINs
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public Item createItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }

    // Accessible only by ADMINs
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));

        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());

        Item updatedItem = itemRepository.save(item);
        return ResponseEntity.ok(updatedItem);
    }

    // Accessible only by ADMINs
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        itemRepository.delete(item);
        return ResponseEntity.noContent().build();
    }
}
