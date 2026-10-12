const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const themeToggle = document.querySelector('#themeToggle');

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

const typedTech = document.querySelector('.typed-tech');
const technologies = ['Java', 'Spring Boot', 'Microservices', 'REST APIs', 'React'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typedTech && !reducedMotion) {
  let technologyIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  const typeTechnology = () => {
    const currentTechnology = technologies[technologyIndex];
    characterIndex += deleting ? -1 : 1;
    typedTech.textContent = currentTechnology.slice(0, characterIndex);

    let delay = deleting ? 55 : 105;
    if (!deleting && characterIndex === currentTechnology.length) {
      delay = 1500;
      deleting = true;
    } else if (deleting && characterIndex === 0) {
      deleting = false;
      technologyIndex = (technologyIndex + 1) % technologies.length;
      delay = 300;
    }
    window.setTimeout(typeTechnology, delay);
  };

  typeTechnology();
}

const liveCode = document.querySelector('#liveCode');
const codeFileName = document.querySelector('#codeFileName');
const codeStatus = document.querySelector('#codeStatus');
const codeTopics = document.querySelectorAll('.code-topic');
const codeExamples = {
  crud: {
    file: 'ProductController.java', label: 'Typing secure CRUD API…', code: `@RestController
@RequestMapping("/api/products")
class ProductController {
  private final ProductService service;

  @PostMapping
  ResponseEntity<Product> create(@Valid @RequestBody ProductRequest request) {
    return ResponseEntity.status(201).body(service.create(request));
  }

  @GetMapping("/{id}")
  Product findById(@PathVariable Long id) { return service.findById(id); }
}`
  },
  security: {
    file: 'SecurityConfig.java', label: 'Securing endpoints with JWT…', code: `@Configuration
@EnableWebSecurity
class SecurityConfig {
  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    return http.csrf(csrf -> csrf.disable())
      .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated())
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
  }
}`
  },
  exceptions: {
    file: 'GlobalExceptionHandler.java', label: 'Handling API errors…', code: `@RestControllerAdvice
class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
    ApiError error = new ApiError("NOT_FOUND", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }
}`
  },
  streams: {
    file: 'OrderAnalytics.java', label: 'Processing data with streams…', code: `List<String> topCustomers = orders.stream()
  .filter(order -> order.status() == Status.COMPLETED)
  .collect(groupingBy(Order::customerId, summingDouble(Order::total)))
  .entrySet().stream()
  .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
  .limit(5)
  .map(Map.Entry::getKey)
  .toList();`
  },
  threads: {
    file: 'ReportService.java', label: 'Running work asynchronously…', code: `@Service
class ReportService {
  @Async("taskExecutor")
  CompletableFuture<Report> generateAsync(UUID reportId) {
    Report report = reportRepository.findById(reportId)
      .orElseThrow(() -> new ResourceNotFoundException("Report"));
    return CompletableFuture.completedFuture(buildReport(report));
  }
}`
  },
  feign: {
    file: 'InventoryClient.java', label: 'Calling services with OpenFeign…', code: `@FeignClient(name = "inventory-service")
interface InventoryClient {
  @GetMapping("/api/stock/{productId}")
  StockResponse getStock(@PathVariable Long productId);
}

@Bean @LoadBalanced
RestTemplate restTemplate() { return new RestTemplate(); }
// Service discovery balances requests across instances`
  },
  kafka: {
    file: 'OrderEventProducer.java', label: 'Publishing Kafka events…', code: `@Service
class OrderEventProducer {
  private final KafkaTemplate<String, OrderCreatedEvent> kafka;

  void publish(Order order) {
    OrderCreatedEvent event = OrderCreatedEvent.from(order);
    kafka.send("order.created", order.getId().toString(), event);
  }
}
// topic: order.created · key: order id`
  },
  patterns: {
    file: 'PaymentStrategy.java', label: 'Applying OOP and strategy pattern…', code: `interface PaymentStrategy { Receipt pay(Money amount); }

@Service
class PaymentService {
  private final Map<PaymentType, PaymentStrategy> strategies;
  Receipt pay(PaymentType type, Money amount) {
    return Optional.ofNullable(strategies.get(type))
      .orElseThrow(() -> new IllegalArgumentException("Unsupported type"))
      .pay(amount);
  }
}`
  }
};

if (liveCode) {
  let activeExample = 'crud';
  let codeTimer;
  let rotateTimer;
  const exampleKeys = Object.keys(codeExamples);

  const highlightJava = (value) => value.split('\n').map(line => {
    const commentStart = line.indexOf('//');
    const source = commentStart < 0 ? line : line.slice(0, commentStart);
    const comment = commentStart < 0 ? '' : line.slice(commentStart);
    const savedStrings = [];
    let highlighted = source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("[^"]*")/g, match => { savedStrings.push(match); return `§${savedStrings.length - 1}§`; })
      .replace(/(@\w+)/g, '<span class="token-annotation">$1</span>')
      .replace(/\b(public|private|class|interface|return|new|final|void|static|throws)\b/g, '<span class="token-keyword">$1</span>')
      .replace(/\b(ResponseEntity|List|Map|Optional|CompletableFuture|RestTemplate|KafkaTemplate|Receipt|Money|UUID)\b/g, '<span class="token-type">$1</span>');
    savedStrings.forEach((string, index) => { highlighted = highlighted.replace(`§${index}§`, `<span class="token-string">${string}</span>`); });
    return highlighted + (comment ? `<span class="token-comment">${comment}</span>` : '');
  }).join('\n');

  const renderExample = (key) => {
    window.clearTimeout(codeTimer); window.clearTimeout(rotateTimer);
    activeExample = key;
    const example = codeExamples[key];
    let position = 0;
    codeFileName.textContent = example.file;
    codeStatus.textContent = example.label;
    codeTopics.forEach(button => button.classList.toggle('active', button.dataset.snippet === key));
    const writeCode = () => {
      position += 2;
      liveCode.innerHTML = highlightJava(example.code.slice(0, position));
      if (position < example.code.length) codeTimer = window.setTimeout(writeCode, 7);
      else {
        codeStatus.textContent = 'Live example ready — choose another topic';
        rotateTimer = window.setTimeout(() => {
          const next = exampleKeys[(exampleKeys.indexOf(activeExample) + 1) % exampleKeys.length];
          renderExample(next);
        }, 4800);
      }
    };
    if (reducedMotion) { position = example.code.length; liveCode.innerHTML = highlightJava(example.code); codeStatus.textContent = 'Live example ready'; }
    else writeCode();
  };

  codeTopics.forEach(button => button.addEventListener('click', () => renderExample(button.dataset.snippet)));
  renderExample(activeExample);
}
